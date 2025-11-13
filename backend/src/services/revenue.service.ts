import { AppDataSource } from '../config/database';
import { RevenueDistribution, Opportunity } from '../entities';
import {
  differenceInMonths,
  addMonths,
  startOfMonth,
  getYear,
  getMonth,
} from 'date-fns';

const revenueRepository = AppDataSource.getRepository(RevenueDistribution);

export interface MonthlyRevenue {
  year: number;
  month: number;
  sales_amount: number;
  gross_margin_amount: number;
  is_forecast: boolean;
}

export interface YearlySummary {
  year: number;
  sales_amount: number;
  gross_margin_amount: number;
  months: number;
}

export class RevenueService {
  /**
   * Calculate monthly revenue distribution for an opportunity
   */
  calculateMonthlyDistribution(
    weightedAmount: number,
    grossMarginPercentage: number,
    startingDate: Date,
    closingDate: Date
  ): MonthlyRevenue[] {
    // Calculate duration in months
    const start = startOfMonth(new Date(startingDate));
    const end = startOfMonth(new Date(closingDate));
    const durationMonths = differenceInMonths(end, start) + 1; // +1 to include both start and end months

    if (durationMonths <= 0) {
      return [];
    }

    // Calculate monthly amounts
    const monthlyRevenue = weightedAmount / durationMonths;
    const monthlyGrossMargin = monthlyRevenue * grossMarginPercentage;

    // Generate monthly distribution
    const distribution: MonthlyRevenue[] = [];

    for (let i = 0; i < durationMonths; i++) {
      const currentMonth = addMonths(start, i);

      distribution.push({
        year: getYear(currentMonth),
        month: getMonth(currentMonth) + 1, // getMonth returns 0-11, we want 1-12
        sales_amount: Math.round(monthlyRevenue * 100) / 100,
        gross_margin_amount: Math.round(monthlyGrossMargin * 100) / 100,
        is_forecast: true,
      });
    }

    return distribution;
  }

  /**
   * Create or update revenue distribution for an opportunity
   */
  async updateRevenueDistribution(
    opportunity: Opportunity,
    weightedAmount: number,
    grossMarginPercentage: number
  ): Promise<RevenueDistribution[]> {
    // Delete existing distribution
    await revenueRepository.delete({ opportunity_id: opportunity.id });

    // Calculate new distribution
    const monthlyDistribution = this.calculateMonthlyDistribution(
      weightedAmount,
      grossMarginPercentage,
      opportunity.starting_date,
      opportunity.closing_date
    );

    // Create revenue distribution records
    const distributions = monthlyDistribution.map((item) =>
      revenueRepository.create({
        opportunity_id: opportunity.id,
        year: item.year,
        month: item.month,
        sales_amount: item.sales_amount,
        gross_margin_amount: item.gross_margin_amount,
        is_forecast: item.is_forecast,
      })
    );

    // Save all distribution records
    return revenueRepository.save(distributions);
  }

  /**
   * Get revenue distribution for an opportunity
   */
  async getRevenueDistribution(
    opportunityId: string
  ): Promise<{
    monthly_distribution: MonthlyRevenue[];
    yearly_summary: YearlySummary[];
  }> {
    const distributions = await revenueRepository.find({
      where: { opportunity_id: opportunityId },
      order: { year: 'ASC', month: 'ASC' },
    });

    // Group by year for summary
    const yearlyMap = new Map<number, YearlySummary>();

    for (const dist of distributions) {
      const year = dist.year;

      if (!yearlyMap.has(year)) {
        yearlyMap.set(year, {
          year,
          sales_amount: 0,
          gross_margin_amount: 0,
          months: 0,
        });
      }

      const yearData = yearlyMap.get(year)!;
      yearData.sales_amount += parseFloat(dist.sales_amount.toString());
      yearData.gross_margin_amount += parseFloat(dist.gross_margin_amount.toString());
      yearData.months += 1;
    }

    // Convert to array and round amounts
    const yearly_summary = Array.from(yearlyMap.values()).map((item) => ({
      ...item,
      sales_amount: Math.round(item.sales_amount * 100) / 100,
      gross_margin_amount: Math.round(item.gross_margin_amount * 100) / 100,
    }));

    const monthly_distribution = distributions.map((dist) => ({
      year: dist.year,
      month: dist.month,
      sales_amount: parseFloat(dist.sales_amount.toString()),
      gross_margin_amount: parseFloat(dist.gross_margin_amount.toString()),
      is_forecast: dist.is_forecast,
    }));

    return {
      monthly_distribution,
      yearly_summary,
    };
  }

  /**
   * Get aggregated revenue forecast by period
   */
  async getAggregateForecast(
    opportunityIds: string[],
    startYear?: number,
    endYear?: number
  ): Promise<{
    by_month: Array<{ year: number; month: number; sales_amount: number; gross_margin_amount: number }>;
    by_year: Array<{ year: number; sales_amount: number; gross_margin_amount: number }>;
  }> {
    let query = revenueRepository
      .createQueryBuilder('rd')
      .where('rd.opportunity_id IN (:...ids)', { ids: opportunityIds });

    if (startYear) {
      query = query.andWhere('rd.year >= :startYear', { startYear });
    }

    if (endYear) {
      query = query.andWhere('rd.year <= :endYear', { endYear });
    }

    const distributions = await query.getMany();

    // Aggregate by month
    const monthlyMap = new Map<string, { year: number; month: number; sales: number; margin: number }>();

    for (const dist of distributions) {
      const key = `${dist.year}-${dist.month}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          year: dist.year,
          month: dist.month,
          sales: 0,
          margin: 0,
        });
      }

      const data = monthlyMap.get(key)!;
      data.sales += parseFloat(dist.sales_amount.toString());
      data.margin += parseFloat(dist.gross_margin_amount.toString());
    }

    const by_month = Array.from(monthlyMap.values())
      .map((item) => ({
        year: item.year,
        month: item.month,
        sales_amount: Math.round(item.sales * 100) / 100,
        gross_margin_amount: Math.round(item.margin * 100) / 100,
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    // Aggregate by year
    const yearlyMap = new Map<number, { sales: number; margin: number }>();

    for (const item of by_month) {
      if (!yearlyMap.has(item.year)) {
        yearlyMap.set(item.year, { sales: 0, margin: 0 });
      }

      const yearData = yearlyMap.get(item.year)!;
      yearData.sales += item.sales_amount;
      yearData.margin += item.gross_margin_amount;
    }

    const by_year = Array.from(yearlyMap.entries())
      .map(([year, data]) => ({
        year,
        sales_amount: Math.round(data.sales * 100) / 100,
        gross_margin_amount: Math.round(data.margin * 100) / 100,
      }))
      .sort((a, b) => a.year - b.year);

    return { by_month, by_year };
  }
}

export default new RevenueService();
