import { Request, Response, NextFunction } from 'express';
import teamService from '../services/team.service';
import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto';

export class TeamController {
  /**
   * Get all teams
   * GET /api/teams
   */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teams = await teamService.findAll();
      res.status(200).json({ items: teams, total: teams.length });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get team by ID
   * GET /api/teams/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const team = await teamService.findById(id);

      if (!team) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Team not found',
          },
        });
        return;
      }

      res.status(200).json(team);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Create team (admin only)
   * POST /api/teams
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateTeamDto = req.body;
      const team = await teamService.create(data);

      res.status(201).json(team);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Update team (admin only)
   * PUT /api/teams/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateTeamDto = req.body;

      const team = await teamService.update(id, data);

      res.status(200).json(team);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Delete team (admin only)
   * DELETE /api/teams/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await teamService.delete(id);

      res.status(204).send();
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get team members
   * GET /api/teams/:id/members
   */
  async getMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const members = await teamService.getMembers(id);

      res.status(200).json({ items: members, total: members.length });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get team statistics
   * GET /api/teams/:id/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await teamService.getTeamStats(id);

      res.status(200).json(stats);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new TeamController();
