import { Router } from 'express';
import teamController from '../controllers/team.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { CreateTeamDto, UpdateTeamDto } from '../dto/team.dto';
import { UserRole } from '../entities';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List teams (all authenticated users)
router.get('/', teamController.getAll.bind(teamController));

// Get team by ID (all authenticated users)
router.get('/:id', teamController.getById.bind(teamController));

// Get team members (all authenticated users)
router.get('/:id/members', teamController.getMembers.bind(teamController));

// Get team stats (managers and admins)
router.get(
  '/:id/stats',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  teamController.getStats.bind(teamController)
);

// Admin-only routes
router.post(
  '/',
  authorize(UserRole.ADMIN),
  validateDto(CreateTeamDto),
  teamController.create.bind(teamController)
);

router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateDto(UpdateTeamDto),
  teamController.update.bind(teamController)
);

router.delete('/:id', authorize(UserRole.ADMIN), teamController.delete.bind(teamController));

export default router;
