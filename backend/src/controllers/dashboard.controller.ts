import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { UserRole } from '../entities';

export class DashboardController {
  /**
   * Get individual dashboard (sales users see their own, managers/admins can specify userId)
   * GET /api/dashboard/individual
   * GET /api/dashboard/individual/:userId (managers/admins only)
   */
  async getIndividual(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      let userId: string;

      // If userId is provided in params, check authorization
      if (req.params.userId) {
        // Only managers and admins can view other users' dashboards
        if (
          currentUser.role !== UserRole.MANAGER &&
          currentUser.role !== UserRole.ADMIN
        ) {
          res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'You can only view your own dashboard',
            },
          });
          return;
        }
        userId = req.params.userId;
      } else {
        // No userId provided, use current user
        userId = currentUser.userId;
      }

      const dashboard = await dashboardService.getIndividualDashboard(userId);
      res.status(200).json(dashboard);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get team dashboard (managers see their team, admins can specify teamId)
   * GET /api/dashboard/team
   * GET /api/dashboard/team/:teamId (admins can specify any team)
   */
  async getTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user;
      let teamId: string;

      // If teamId is provided in params
      if (req.params.teamId) {
        // Only admins can view any team's dashboard
        if (currentUser.role !== UserRole.ADMIN) {
          res.status(403).json({
            error: {
              code: 'FORBIDDEN',
              message: 'Only admins can view other teams dashboards',
            },
          });
          return;
        }
        teamId = req.params.teamId;
      } else {
        // No teamId provided, use current user's team
        if (!currentUser.teamId) {
          res.status(400).json({
            error: {
              code: 'BAD_REQUEST',
              message: 'User is not assigned to any team',
            },
          });
          return;
        }
        teamId = currentUser.teamId;
      }

      const dashboard = await dashboardService.getTeamDashboard(teamId);
      res.status(200).json(dashboard);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get global dashboard (admin only)
   * GET /api/dashboard/global
   */
  async getGlobal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dashboard = await dashboardService.getGlobalDashboard();
      res.status(200).json(dashboard);
    } catch (error: any) {
      next(error);
    }
  }
}

export default new DashboardController();
