import ExcelJS from 'exceljs';
import { AppDataSource } from '../config/database';
import { Opportunity, OpportunityStatus, OpportunityStage } from '../entities';
import { format } from 'date-fns';

interface ExportFilters {
  status?: OpportunityStatus;
  stage?: OpportunityStage;
  owner_id?: string;
  team_id?: string;
  service_type?: string;
  sector_type?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

export class ExportService {
  private opportunityRepository = AppDataSource.getRepository(Opportunity);

  /**
   * Export opportunities to Excel format
   */
  async exportToExcel(filters: ExportFilters, userId: string, userRole: string): Promise<ExcelJS.Buffer> {
    // Get filtered opportunities
    const opportunities = await this.getFilteredOpportunities(filters, userId, userRole);

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Opportunities');

    // Define columns (matching the original Excel format from requirements)
    worksheet.columns = [
      { header: 'Project Name', key: 'project_name', width: 30 },
      { header: 'Service Type', key: 'service_type', width: 15 },
      { header: 'Sector Type', key: 'sector_type', width: 20 },
      { header: 'Original Amount ($)', key: 'original_amount', width: 18 },
      { header: 'Project Maturity', key: 'project_maturity', width: 18 },
      { header: 'Client Type', key: 'client_type', width: 15 },
      { header: 'Client Relationship', key: 'client_relationship', width: 20 },
      { header: 'Conservative', key: 'conservative_approach', width: 15 },
      { header: 'Probability Score', key: 'probability_score', width: 18 },
      { header: 'Weighted Amount ($)', key: 'weighted_amount', width: 20 },
      { header: 'Starting Date', key: 'starting_date', width: 15 },
      { header: 'Closing Date', key: 'closing_date', width: 15 },
      { header: 'Duration (months)', key: 'duration_months', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Stage', key: 'stage', width: 15 },
      { header: 'Owner', key: 'owner_name', width: 25 },
      { header: 'Team', key: 'team_name', width: 25 },
      { header: 'Created At', key: 'created_at', width: 18 },
      { header: 'Notes', key: 'notes', width: 40 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    opportunities.forEach((opp) => {
      const durationMonths = opp.closing_date && opp.starting_date
        ? Math.round(
            (new Date(opp.closing_date).getTime() - new Date(opp.starting_date).getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          )
        : 0;

      worksheet.addRow({
        project_name: opp.project_name,
        service_type: opp.service_type,
        sector_type: opp.sector_type,
        original_amount: Number(opp.original_amount),
        project_maturity: opp.project_maturity,
        client_type: opp.client_type,
        client_relationship: opp.client_relationship,
        conservative_approach: opp.conservative_approach ? 'Yes' : 'No',
        probability_score: `${(Number(opp.probability_score) * 100).toFixed(2)}%`,
        weighted_amount: Number(opp.weighted_amount),
        starting_date: opp.starting_date ? format(new Date(opp.starting_date), 'yyyy-MM-dd') : '',
        closing_date: opp.closing_date ? format(new Date(opp.closing_date), 'yyyy-MM-dd') : '',
        duration_months: durationMonths,
        status: opp.status,
        stage: opp.stage,
        owner_name: opp.owner ? `${opp.owner.first_name} ${opp.owner.last_name}` : '',
        team_name: opp.owner?.team?.name || '',
        created_at: format(new Date(opp.created_at), 'yyyy-MM-dd HH:mm'),
        notes: opp.update_notes || '',
      });
    });

    // Format currency columns
    worksheet.getColumn('original_amount').numFmt = '$#,##0.00';
    worksheet.getColumn('weighted_amount').numFmt = '$#,##0.00';

    // Add auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: `S1`,
    };

    // Freeze header row
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    // Add summary row at the bottom
    const lastRow = worksheet.lastRow;
    if (lastRow) {
      const summaryRow = worksheet.addRow({
        project_name: 'TOTAL',
        original_amount: { formula: `SUM(D2:D${lastRow.number})` },
        weighted_amount: { formula: `SUM(J2:J${lastRow.number})` },
      });
      summaryRow.font = { bold: true };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };
    }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  /**
   * Export opportunities to CSV format
   */
  async exportToCSV(filters: ExportFilters, userId: string, userRole: string): Promise<string> {
    // Get filtered opportunities
    const opportunities = await this.getFilteredOpportunities(filters, userId, userRole);

    // CSV headers
    const headers = [
      'Project Name',
      'Service Type',
      'Sector Type',
      'Original Amount',
      'Project Maturity',
      'Client Type',
      'Client Relationship',
      'Conservative',
      'Probability Score',
      'Weighted Amount',
      'Starting Date',
      'Closing Date',
      'Duration (months)',
      'Status',
      'Stage',
      'Owner',
      'Team',
      'Created At',
      'Notes',
    ];

    // Build CSV content
    let csv = headers.join(',') + '\n';

    opportunities.forEach((opp) => {
      const durationMonths = opp.closing_date && opp.starting_date
        ? Math.round(
            (new Date(opp.closing_date).getTime() - new Date(opp.starting_date).getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          )
        : 0;

      const row = [
        this.escapeCSV(opp.project_name),
        this.escapeCSV(opp.service_type),
        this.escapeCSV(opp.sector_type),
        Number(opp.original_amount).toFixed(2),
        this.escapeCSV(opp.project_maturity),
        this.escapeCSV(opp.client_type),
        this.escapeCSV(opp.client_relationship),
        opp.conservative_approach ? 'Yes' : 'No',
        (Number(opp.probability_score) * 100).toFixed(2) + '%',
        Number(opp.weighted_amount).toFixed(2),
        opp.starting_date ? format(new Date(opp.starting_date), 'yyyy-MM-dd') : '',
        opp.closing_date ? format(new Date(opp.closing_date), 'yyyy-MM-dd') : '',
        durationMonths.toString(),
        this.escapeCSV(opp.status),
        this.escapeCSV(opp.stage),
        opp.owner ? this.escapeCSV(`${opp.owner.first_name} ${opp.owner.last_name}`) : '',
        opp.owner?.team ? this.escapeCSV(opp.owner.team.name) : '',
        format(new Date(opp.created_at), 'yyyy-MM-dd HH:mm'),
        this.escapeCSV(opp.update_notes || ''),
      ];

      csv += row.join(',') + '\n';
    });

    return csv;
  }

  /**
   * Export revenue distribution to Excel
   */
  async exportRevenueDistribution(
    filters: ExportFilters,
    userId: string,
    userRole: string
  ): Promise<ExcelJS.Buffer> {
    // Get filtered opportunities with revenue distribution
    const opportunities = await this.getFilteredOpportunities(filters, userId, userRole);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revenue Distribution');

    // Define columns
    worksheet.columns = [
      { header: 'Project Name', key: 'project_name', width: 30 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Sales Amount ($)', key: 'sales_amount', width: 18 },
      { header: 'Gross Margin ($)', key: 'gross_margin', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Owner', key: 'owner', width: 25 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };

    // Add data rows
    opportunities.forEach((opp) => {
      if (opp.revenue_distribution && opp.revenue_distribution.length > 0) {
        opp.revenue_distribution.forEach((rd) => {
          worksheet.addRow({
            project_name: opp.project_name,
            year: rd.year,
            month: rd.month,
            sales_amount: Number(rd.sales_amount),
            gross_margin: Number(rd.gross_margin_amount),
            status: opp.status,
            owner: opp.owner ? `${opp.owner.first_name} ${opp.owner.last_name}` : '',
          });
        });
      }
    });

    // Format currency columns
    worksheet.getColumn('sales_amount').numFmt = '$#,##0.00';
    worksheet.getColumn('gross_margin').numFmt = '$#,##0.00';

    // Add auto-filter
    worksheet.autoFilter = {
      from: 'A1',
      to: `G1`,
    };

    // Freeze header row
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }

  /**
   * Get filtered opportunities based on criteria
   */
  private async getFilteredOpportunities(
    filters: ExportFilters,
    userId: string,
    userRole: string
  ): Promise<Opportunity[]> {
    const query = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.owner', 'owner')
      .leftJoinAndSelect('owner.team', 'team')
      .leftJoinAndSelect('opportunity.revenue_distribution', 'revenue_distribution')
      .orderBy('opportunity.created_at', 'DESC');

    // Apply role-based filtering
    if (userRole === 'sales') {
      query.andWhere('owner.id = :userId', { userId });
    } else if (userRole === 'manager' && filters.team_id) {
      query.andWhere('team.id = :teamId', { teamId: filters.team_id });
    }

    // Apply filters
    if (filters.status) {
      query.andWhere('opportunity.status = :status', { status: filters.status });
    }

    if (filters.stage) {
      query.andWhere('opportunity.stage = :stage', { stage: filters.stage });
    }

    if (filters.owner_id) {
      query.andWhere('owner.id = :ownerId', { ownerId: filters.owner_id });
    }

    if (filters.service_type) {
      query.andWhere('opportunity.service_type = :serviceType', {
        serviceType: filters.service_type,
      });
    }

    if (filters.sector_type) {
      query.andWhere('opportunity.sector_type = :sectorType', {
        sectorType: filters.sector_type,
      });
    }

    if (filters.date_from) {
      query.andWhere('opportunity.starting_date >= :dateFrom', {
        dateFrom: filters.date_from,
      });
    }

    if (filters.date_to) {
      query.andWhere('opportunity.closing_date <= :dateTo', {
        dateTo: filters.date_to,
      });
    }

    if (filters.search) {
      query.andWhere(
        '(opportunity.project_name ILIKE :search OR opportunity.update_notes ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.getMany();
  }

  /**
   * Helper: Escape CSV values
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export default new ExportService();
