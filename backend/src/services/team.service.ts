import { AppDataSource } from '../config/database';
import { Team, User } from '../entities';
import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto';

const teamRepository = AppDataSource.getRepository(Team);
const userRepository = AppDataSource.getRepository(User);

export class TeamService {
  /**
   * Get all teams
   */
  async findAll(): Promise<Team[]> {
    const teams = await teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.manager', 'manager')
      .loadRelationCountAndMap('team.member_count', 'team.manager', 'members', (qb) =>
        qb.where('members.team_id = team.id')
      )
      .orderBy('team.created_at', 'DESC')
      .getMany();

    return teams;
  }

  /**
   * Get team by ID
   */
  async findById(id: string): Promise<Team | null> {
    const team = await teamRepository.findOne({
      where: { id },
      relations: ['manager'],
    });

    if (!team) {
      return null;
    }

    // Get team members
    const members = await userRepository.find({
      where: { team_id: id },
      select: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active'],
    });

    (team as any).members = members;
    (team as any).member_count = members.length;

    return team;
  }

  /**
   * Create team
   */
  async create(data: CreateTeamDto): Promise<Team> {
    // Verify manager exists
    const manager = await userRepository.findOne({ where: { id: data.manager_id } });

    if (!manager) {
      throw new Error('Manager not found');
    }

    const team = teamRepository.create(data);
    return teamRepository.save(team);
  }

  /**
   * Update team
   */
  async update(id: string, data: UpdateTeamDto): Promise<Team> {
    const team = await teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new Error('Team not found');
    }

    // If changing manager, verify new manager exists
    if (data.manager_id) {
      const manager = await userRepository.findOne({ where: { id: data.manager_id } });
      if (!manager) {
        throw new Error('Manager not found');
      }
    }

    // Update fields
    if (data.name !== undefined) team.name = data.name;
    if (data.manager_id !== undefined) team.manager_id = data.manager_id;
    if (data.description !== undefined) team.description = data.description;

    return teamRepository.save(team);
  }

  /**
   * Delete team
   */
  async delete(id: string): Promise<void> {
    const team = await teamRepository.findOne({ where: { id } });

    if (!team) {
      throw new Error('Team not found');
    }

    // Check if team has members
    const memberCount = await userRepository.count({ where: { team_id: id } });

    if (memberCount > 0) {
      throw new Error(
        'Cannot delete team with members. Please reassign members to another team first.'
      );
    }

    await teamRepository.remove(team);
  }

  /**
   * Get team members
   */
  async getMembers(teamId: string): Promise<User[]> {
    const members = await userRepository.find({
      where: { team_id: teamId },
      select: ['id', 'first_name', 'last_name', 'email', 'role', 'is_active', 'created_at'],
    });

    return members;
  }

  /**
   * Get team opportunities
   */
  async getTeamOpportunities(teamId: string): Promise<any> {
    // This would use the OpportunityService to get opportunities for the team
    // For now, return a placeholder
    return { team_id: teamId, opportunities: [] };
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<any> {
    const stats = await teamRepository
      .createQueryBuilder('team')
      .leftJoin('opportunities', 'opp', 'opp.team_id = team.id')
      .select('team.id', 'team_id')
      .addSelect('team.name', 'team_name')
      .addSelect('COUNT(DISTINCT opp.id)', 'total_opportunities')
      .addSelect(
        'COUNT(DISTINCT CASE WHEN opp.status = :active THEN opp.id END)',
        'active_opportunities'
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN opp.status = :won THEN opp.id END)',
        'won_opportunities'
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN opp.status = :lost THEN opp.id END)',
        'lost_opportunities'
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN opp.status = :active THEN opp.weighted_amount ELSE 0 END), 0)',
        'pipeline_value'
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN opp.status = :active THEN opp.original_amount ELSE 0 END), 0)',
        'total_value'
      )
      .where('team.id = :teamId', { teamId })
      .setParameters({ active: 'Active', won: 'Won', lost: 'Lost' })
      .groupBy('team.id')
      .addGroupBy('team.name')
      .getRawOne();

    // Get member count
    const memberCount = await userRepository.count({ where: { team_id: teamId } });

    return {
      ...(stats || {
        team_id: teamId,
        total_opportunities: 0,
        active_opportunities: 0,
        won_opportunities: 0,
        lost_opportunities: 0,
        pipeline_value: 0,
        total_value: 0,
      }),
      member_count: memberCount,
    };
  }
}

export default new TeamService();
