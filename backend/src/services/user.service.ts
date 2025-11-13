import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities';
import { UpdateUserDto, UpdateProfileDto } from '../dto/user.dto';

const userRepository = AppDataSource.getRepository(User);

export class UserService {
  /**
   * Get all users (admin/manager only)
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    role?: UserRole,
    teamId?: string,
    search?: string
  ): Promise<{ items: User[]; total: number; page: number; limit: number; pages: number }> {
    const skip = (page - 1) * limit;

    const query = userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.team', 'team')
      .where('user.id IS NOT NULL');

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (teamId) {
      query.andWhere('user.team_id = :teamId', { teamId });
    }

    if (search) {
      query.andWhere(
        '(user.first_name ILIKE :search OR user.last_name ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const total = await query.getCount();
    const items = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.created_at', 'DESC')
      .getMany();

    // Remove password hashes
    items.forEach((user) => delete (user as any).password_hash);

    const pages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      pages,
    };
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (user) {
      delete (user as any).password_hash;
    }

    return user;
  }

  /**
   * Update user (admin only)
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    // Update fields
    if (data.first_name !== undefined) user.first_name = data.first_name;
    if (data.last_name !== undefined) user.last_name = data.last_name;
    if (data.email !== undefined) user.email = data.email;
    if (data.team_id !== undefined) user.team_id = data.team_id;
    if (data.role !== undefined) user.role = data.role;
    if (data.is_active !== undefined) user.is_active = data.is_active;
    if (data.profile_picture_url !== undefined)
      user.profile_picture_url = data.profile_picture_url;

    const updated = await userRepository.save(user);
    delete (updated as any).password_hash;

    return updated;
  }

  /**
   * Update own profile
   */
  async updateProfile(id: string, data: UpdateProfileDto): Promise<User> {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    if (data.first_name !== undefined) user.first_name = data.first_name;
    if (data.last_name !== undefined) user.last_name = data.last_name;
    if (data.profile_picture_url !== undefined)
      user.profile_picture_url = data.profile_picture_url;

    const updated = await userRepository.save(user);
    delete (updated as any).password_hash;

    return updated;
  }

  /**
   * Delete user (admin only)
   */
  async delete(id: string): Promise<void> {
    const user = await userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    await userRepository.remove(user);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const stats = await userRepository
      .createQueryBuilder('user')
      .leftJoin('user.team', 'team')
      .leftJoin('opportunities', 'opp', 'opp.owner_id = user.id')
      .select('user.id', 'user_id')
      .addSelect('COUNT(DISTINCT opp.id)', 'total_opportunities')
      .addSelect('COUNT(DISTINCT CASE WHEN opp.status = :active THEN opp.id END)', 'active_opportunities')
      .addSelect('COUNT(DISTINCT CASE WHEN opp.status = :won THEN opp.id END)', 'won_opportunities')
      .addSelect('COUNT(DISTINCT CASE WHEN opp.status = :lost THEN opp.id END)', 'lost_opportunities')
      .addSelect('COALESCE(SUM(CASE WHEN opp.status = :active THEN opp.weighted_amount ELSE 0 END), 0)', 'pipeline_value')
      .where('user.id = :userId', { userId })
      .setParameters({ active: 'Active', won: 'Won', lost: 'Lost' })
      .groupBy('user.id')
      .getRawOne();

    return stats || {
      user_id: userId,
      total_opportunities: 0,
      active_opportunities: 0,
      won_opportunities: 0,
      lost_opportunities: 0,
      pipeline_value: 0,
    };
  }
}

export default new UserService();
