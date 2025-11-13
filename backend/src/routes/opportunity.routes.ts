import { Router } from 'express';
import opportunityController from '../controllers/opportunity.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateOpportunityStatusDto,
  BulkUpdateOpportunitiesDto,
} from '../dto/opportunity.dto';
import { UserRole } from '../entities';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List opportunities (all users)
router.get('/', opportunityController.getAll.bind(opportunityController));

// Create opportunity (all users)
router.post(
  '/',
  validateDto(CreateOpportunityDto),
  opportunityController.create.bind(opportunityController)
);

// Bulk update (managers and admins only)
router.post(
  '/bulk-update',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  validateDto(BulkUpdateOpportunitiesDto),
  opportunityController.bulkUpdate.bind(opportunityController)
);

// Get opportunity by ID
router.get('/:id', opportunityController.getById.bind(opportunityController));

// Update opportunity
router.put(
  '/:id',
  validateDto(UpdateOpportunityDto),
  opportunityController.update.bind(opportunityController)
);

// Delete opportunity
router.delete('/:id', opportunityController.delete.bind(opportunityController));

// Duplicate opportunity
router.post('/:id/duplicate', opportunityController.duplicate.bind(opportunityController));

// Update status
router.put(
  '/:id/status',
  validateDto(UpdateOpportunityStatusDto),
  opportunityController.updateStatus.bind(opportunityController)
);

// Get activities
router.get('/:id/activities', opportunityController.getActivities.bind(opportunityController));

// Add activity
router.post('/:id/activities', opportunityController.addActivity.bind(opportunityController));

// Get revenue distribution
router.get(
  '/:id/revenue-distribution',
  opportunityController.getRevenueDistribution.bind(opportunityController)
);

export default router;
