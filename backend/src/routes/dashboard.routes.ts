import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '../entities';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Individual dashboard
// Sales users can only see their own, managers/admins can specify userId
router.get(
  '/individual',
  dashboardController.getIndividual.bind(dashboardController)
);

router.get(
  '/individual/:userId',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  dashboardController.getIndividual.bind(dashboardController)
);

// Team dashboard
// Managers see their team, admins can specify any team
router.get(
  '/team',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  dashboardController.getTeam.bind(dashboardController)
);

router.get(
  '/team/:teamId',
  authorize(UserRole.ADMIN),
  dashboardController.getTeam.bind(dashboardController)
);

// Global dashboard (admin only)
router.get(
  '/global',
  authorize(UserRole.ADMIN),
  dashboardController.getGlobal.bind(dashboardController)
);

export default router;
