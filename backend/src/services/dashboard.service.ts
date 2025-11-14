import { AppDataSource } from '../config/database';
import { Opportunity, User, Team, OpportunityStatus } from '../entities';

interface IndividualDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    team?: string;
  };
  metrics: {
    total_opportunities: number;
    active_opportunities: number;
    won_opportunities: number;
    lost_opportunities: number;
    pipeline_value: number;
    weighted_pipeline_value: number;
    won_value: number;
    win_rate: number;
    average_deal_size: number;
  };
  opportunities_by_stage: {
    stage: string;
    count: number;
    total_value: number;
  }[];
  opportunities_by_status: {
    status: string;
    count: number;
    total_value: number;
  }[];
  monthly_forecast: {
    year: number;
    month: number;
    sales_amount: number;
    gross_margin_amount: number;
  }[];
  recent_activities: any[];
}

interface TeamDashboard {
  team: {
    id: string;
    name: string;
    manager: string;
  };
  metrics: {
    total_members: number;
    total_opportunities: number;
    active_opportunities: number;
    won_opportunities: number;
    lost_opportunities: number;
    pipeline_value: number;
    weighted_pipeline_value: number;
    won_value: number;
    win_rate: number;
    average_deal_size: number;
  };
  members_performance: {
    user_id: string;
    name: string;
    opportunities_count: number;
    pipeline_value: number;
    won_count: number;
    won_value: number;
  }[];
  opportunities_by_stage: {
    stage: string;
    count: number;
    total_value: number;
  }[];
  opportunities_by_status: {
    status: string;
    count: number;
    total_value: number;
  }[];
  monthly_forecast: {
    year: number;
    month: number;
    sales_amount: number;
    gross_margin_amount: number;
  }[];
}

interface GlobalDashboard {
  metrics: {
    total_users: number;
    total_teams: number;
    total_opportunities: number;
    active_opportunities: number;
    won_opportunities: number;
    lost_opportunities: number;
    pipeline_value: number;
    weighted_pipeline_value: number;
    won_value: number;
    win_rate: number;
    average_deal_size: number;
  };
  teams_performance: {
    team_id: string;
    team_name: string;
    members_count: number;
    opportunities_count: number;
    pipeline_value: number;
    won_count: number;
    won_value: number;
  }[];
  opportunities_by_stage: {
    stage: string;
    count: number;
    total_value: number;
  }[];
  opportunities_by_status: {
    status: string;
    count: number;
    total_value: number;
  }[];
  monthly_forecast: {
    year: number;
    month: number;
    sales_amount: number;
    gross_margin_amount: number;
  }[];
  recent_activities: any[];
}

export class DashboardService {
  private opportunityRepository = AppDataSource.getRepository(Opportunity);
  private userRepository = AppDataSource.getRepository(User);
  private teamRepository = AppDataSource.getRepository(Team);

  /**
   * Get individual sales dashboard for a specific user
   */
  async getIndividualDashboard(userId: string): Promise<IndividualDashboard> {
    // Get user details
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['team'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all user's opportunities
    const opportunities = await this.opportunityRepository.find({
      where: { owner: { id: userId } },
      relations: ['revenue_distribution', 'activities'],
    });

    // Calculate metrics
    const totalOpportunities = opportunities.length;
    const activeOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.ACTIVE
    ).length;
    const wonOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.WON
    ).length;
    const lostOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.LOST
    ).length;

    const pipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const weightedPipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.weighted_amount), 0);

    const wonValue = opportunities
      .filter((o) => o.status === OpportunityStatus.WON)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const closedOpportunities = wonOpportunities + lostOpportunities;
    const winRate = closedOpportunities > 0 ? (wonOpportunities / closedOpportunities) * 100 : 0;

    const averageDealSize =
      wonOpportunities > 0 ? wonValue / wonOpportunities : 0;

    // Group by stage
    const opportunitiesByStage = this.groupByField(
      opportunities.filter((o) => o.status === OpportunityStatus.ACTIVE),
      'stage'
    );

    // Group by status
    const opportunitiesByStatus = this.groupByField(opportunities, 'status');

    // Get monthly forecast (next 12 months)
    const monthlyForecast = await this.getMonthlyForecast(userId, 'user');

    // Get recent activities
    const recentActivities = opportunities
      .flatMap((o) => o.activities || [])
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 10);

    return {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        team: user.team?.name,
      },
      metrics: {
        total_opportunities: totalOpportunities,
        active_opportunities: activeOpportunities,
        won_opportunities: wonOpportunities,
        lost_opportunities: lostOpportunities,
        pipeline_value: Math.round(pipelineValue * 100) / 100,
        weighted_pipeline_value: Math.round(weightedPipelineValue * 100) / 100,
        won_value: Math.round(wonValue * 100) / 100,
        win_rate: Math.round(winRate * 100) / 100,
        average_deal_size: Math.round(averageDealSize * 100) / 100,
      },
      opportunities_by_stage: opportunitiesByStage,
      opportunities_by_status: opportunitiesByStatus,
      monthly_forecast: monthlyForecast,
      recent_activities: recentActivities,
    };
  }

  /**
   * Get team dashboard for managers
   */
  async getTeamDashboard(teamId: string): Promise<TeamDashboard> {
    // Get team details
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['manager'],
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Get all team members
    const teamMembers = await this.userRepository.find({
      where: { team_id: teamId },
    });
    const memberIds = teamMembers.map((m) => m.id);

    // Get all team opportunities
    const opportunities = await this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.owner', 'owner')
      .leftJoinAndSelect('opportunity.revenue_distribution', 'revenue_distribution')
      .where('owner.id IN (:...memberIds)', { memberIds })
      .getMany();

    // Calculate metrics
    const totalMembers = teamMembers.length;
    const totalOpportunities = opportunities.length;
    const activeOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.ACTIVE
    ).length;
    const wonOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.WON
    ).length;
    const lostOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.LOST
    ).length;

    const pipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const weightedPipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.weighted_amount), 0);

    const wonValue = opportunities
      .filter((o) => o.status === OpportunityStatus.WON)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const closedOpportunities = wonOpportunities + lostOpportunities;
    const winRate = closedOpportunities > 0 ? (wonOpportunities / closedOpportunities) * 100 : 0;

    const averageDealSize =
      wonOpportunities > 0 ? wonValue / wonOpportunities : 0;

    // Member performance
    const membersPerformance = await Promise.all(
      teamMembers.map(async (member) => {
        const memberOpps = opportunities.filter((o) => o.owner.id === member.id);
        const memberWonOpps = memberOpps.filter(
          (o) => o.status === OpportunityStatus.WON
        );
        const memberPipelineValue = memberOpps
          .filter((o) => o.status === OpportunityStatus.ACTIVE)
          .reduce((sum, o) => sum + Number(o.original_amount), 0);
        const memberWonValue = memberWonOpps.reduce(
          (sum, o) => sum + Number(o.original_amount),
          0
        );

        return {
          user_id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          opportunities_count: memberOpps.length,
          pipeline_value: Math.round(memberPipelineValue * 100) / 100,
          won_count: memberWonOpps.length,
          won_value: Math.round(memberWonValue * 100) / 100,
        };
      })
    );

    // Group by stage
    const opportunitiesByStage = this.groupByField(
      opportunities.filter((o) => o.status === OpportunityStatus.ACTIVE),
      'stage'
    );

    // Group by status
    const opportunitiesByStatus = this.groupByField(opportunities, 'status');

    // Get monthly forecast
    const monthlyForecast = await this.getMonthlyForecast(teamId, 'team');

    return {
      team: {
        id: team.id,
        name: team.name,
        manager: team.manager
          ? `${team.manager.first_name} ${team.manager.last_name}`
          : 'No manager assigned',
      },
      metrics: {
        total_members: totalMembers,
        total_opportunities: totalOpportunities,
        active_opportunities: activeOpportunities,
        won_opportunities: wonOpportunities,
        lost_opportunities: lostOpportunities,
        pipeline_value: Math.round(pipelineValue * 100) / 100,
        weighted_pipeline_value: Math.round(weightedPipelineValue * 100) / 100,
        won_value: Math.round(wonValue * 100) / 100,
        win_rate: Math.round(winRate * 100) / 100,
        average_deal_size: Math.round(averageDealSize * 100) / 100,
      },
      members_performance: membersPerformance,
      opportunities_by_stage: opportunitiesByStage,
      opportunities_by_status: opportunitiesByStatus,
      monthly_forecast: monthlyForecast,
    };
  }

  /**
   * Get global dashboard for admins
   */
  async getGlobalDashboard(): Promise<GlobalDashboard> {
    // Get all opportunities
    const opportunities = await this.opportunityRepository.find({
      relations: ['owner', 'owner.team', 'revenue_distribution', 'activities'],
    });

    // Get all users and teams
    const totalUsers = await this.userRepository.count();
    const totalTeams = await this.teamRepository.count();

    // Calculate metrics
    const totalOpportunities = opportunities.length;
    const activeOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.ACTIVE
    ).length;
    const wonOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.WON
    ).length;
    const lostOpportunities = opportunities.filter(
      (o) => o.status === OpportunityStatus.LOST
    ).length;

    const pipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const weightedPipelineValue = opportunities
      .filter((o) => o.status === OpportunityStatus.ACTIVE)
      .reduce((sum, o) => sum + Number(o.weighted_amount), 0);

    const wonValue = opportunities
      .filter((o) => o.status === OpportunityStatus.WON)
      .reduce((sum, o) => sum + Number(o.original_amount), 0);

    const closedOpportunities = wonOpportunities + lostOpportunities;
    const winRate = closedOpportunities > 0 ? (wonOpportunities / closedOpportunities) * 100 : 0;

    const averageDealSize =
      wonOpportunities > 0 ? wonValue / wonOpportunities : 0;

    // Get all teams with performance
    const teams = await this.teamRepository.find();

    // Get all users for team member mapping
    const users = await this.userRepository.find();

    const teamsPerformance = await Promise.all(
      teams.map(async (team) => {
        const teamMembers = users.filter((u) => u.team_id === team.id);
        const memberIds = teamMembers.map((m) => m.id);
        const teamOpps = opportunities.filter((o) =>
          memberIds.includes(o.owner.id)
        );
        const teamWonOpps = teamOpps.filter(
          (o) => o.status === OpportunityStatus.WON
        );
        const teamPipelineValue = teamOpps
          .filter((o) => o.status === OpportunityStatus.ACTIVE)
          .reduce((sum, o) => sum + Number(o.original_amount), 0);
        const teamWonValue = teamWonOpps.reduce(
          (sum, o) => sum + Number(o.original_amount),
          0
        );

        return {
          team_id: team.id,
          team_name: team.name,
          members_count: teamMembers.length,
          opportunities_count: teamOpps.length,
          pipeline_value: Math.round(teamPipelineValue * 100) / 100,
          won_count: teamWonOpps.length,
          won_value: Math.round(teamWonValue * 100) / 100,
        };
      })
    );

    // Group by stage
    const opportunitiesByStage = this.groupByField(
      opportunities.filter((o) => o.status === OpportunityStatus.ACTIVE),
      'stage'
    );

    // Group by status
    const opportunitiesByStatus = this.groupByField(opportunities, 'status');

    // Get monthly forecast
    const monthlyForecast = await this.getMonthlyForecast(null, 'global');

    // Get recent activities
    const recentActivities = opportunities
      .flatMap((o) => o.activities || [])
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 20);

    return {
      metrics: {
        total_users: totalUsers,
        total_teams: totalTeams,
        total_opportunities: totalOpportunities,
        active_opportunities: activeOpportunities,
        won_opportunities: wonOpportunities,
        lost_opportunities: lostOpportunities,
        pipeline_value: Math.round(pipelineValue * 100) / 100,
        weighted_pipeline_value: Math.round(weightedPipelineValue * 100) / 100,
        won_value: Math.round(wonValue * 100) / 100,
        win_rate: Math.round(winRate * 100) / 100,
        average_deal_size: Math.round(averageDealSize * 100) / 100,
      },
      teams_performance: teamsPerformance,
      opportunities_by_stage: opportunitiesByStage,
      opportunities_by_status: opportunitiesByStatus,
      monthly_forecast: monthlyForecast,
      recent_activities: recentActivities,
    };
  }

  /**
   * Helper: Group opportunities by field
   */
  private groupByField(
    opportunities: Opportunity[],
    field: 'stage'
  ): { stage: string; count: number; total_value: number }[];
  private groupByField(
    opportunities: Opportunity[],
    field: 'status'
  ): { status: string; count: number; total_value: number }[];
  private groupByField(
    opportunities: Opportunity[],
    field: 'stage' | 'status'
  ): any[] {
    const groups = new Map<string, { count: number; total_value: number }>();

    opportunities.forEach((opp) => {
      const value = opp[field] as string;
      if (!groups.has(value)) {
        groups.set(value, { count: 0, total_value: 0 });
      }
      const group = groups.get(value)!;
      group.count++;
      group.total_value += Number(opp.original_amount);
    });

    return Array.from(groups.entries()).map(([key, data]) => ({
      [field]: key,
      count: data.count,
      total_value: Math.round(data.total_value * 100) / 100,
    }));
  }

  /**
   * Helper: Get monthly revenue forecast
   */
  private async getMonthlyForecast(
    entityId: string | null,
    type: 'user' | 'team' | 'global'
  ): Promise<
    { year: number; month: number; sales_amount: number; gross_margin_amount: number }[]
  > {
    let query = `
      SELECT
        rd.year,
        rd.month,
        SUM(rd.sales_amount) as sales_amount,
        SUM(rd.gross_margin_amount) as gross_margin_amount
      FROM revenue_distribution rd
      INNER JOIN opportunities opp ON rd.opportunity_id = opp.id
      INNER JOIN users u ON opp.owner_id = u.id
      WHERE opp.status = $1
    `;

    const params: any[] = [OpportunityStatus.ACTIVE];

    if (type === 'user' && entityId) {
      query += ' AND u.id = $2';
      params.push(entityId);
    } else if (type === 'team' && entityId) {
      query += ' AND u.team_id = $2';
      params.push(entityId);
    }

    query += `
      GROUP BY rd.year, rd.month
      ORDER BY rd.year, rd.month
      LIMIT 12
    `;

    const result = await AppDataSource.query(query, params);

    return result.map((row: any) => ({
      year: row.year,
      month: row.month,
      sales_amount: Math.round(parseFloat(row.sales_amount) * 100) / 100,
      gross_margin_amount: Math.round(parseFloat(row.gross_margin_amount) * 100) / 100,
    }));
  }
}

export default new DashboardService();
