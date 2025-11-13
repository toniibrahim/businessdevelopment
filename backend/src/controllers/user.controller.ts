import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { UpdateUserDto, UpdateProfileDto } from '../dto/user.dto';
import { UserRole } from '../entities';

export class UserController {
  /**
   * Get all users (admin/manager only)
   * GET /api/users
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as UserRole | undefined;
      const teamId = req.query.team_id as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await userService.findAll(page, limit, role, teamId, search);

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.status(200).json(user);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update user (admin only)
   * PUT /api/users/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateUserDto = req.body;

      const user = await userService.update(id, data);

      res.status(200).json(user);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * DELETE /api/users/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUser = req.user!;

      // Prevent deleting yourself
      if (id === currentUser.userId) {
        res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot delete your own account',
          },
        });
        return;
      }

      await userService.delete(id);

      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const profile = await userService.findById(user.userId);

      if (!profile) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      res.status(200).json(profile);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/me
   */
  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const data: UpdateProfileDto = req.body;

      const updated = await userService.updateProfile(user.userId, data);

      res.status(200).json(updated);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await userService.getUserStats(id);

      res.status(200).json(stats);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new UserController();
