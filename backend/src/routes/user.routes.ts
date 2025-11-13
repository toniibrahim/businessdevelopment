import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateDto } from '../middleware/validation.middleware';
import { UpdateUserDto, UpdateProfileDto } from '../dto/user.dto';
import { UserRole } from '../entities';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Current user routes
router.get('/me', userController.getMe.bind(userController));
router.put(
  '/me',
  validateDto(UpdateProfileDto),
  userController.updateMe.bind(userController)
);

// Admin/Manager routes
router.get(
  '/',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  userController.getAll.bind(userController)
);

router.get(
  '/:id',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  userController.getById.bind(userController)
);

router.get(
  '/:id/stats',
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  userController.getStats.bind(userController)
);

// Admin-only routes
router.put(
  '/:id',
  authorize(UserRole.ADMIN),
  validateDto(UpdateUserDto),
  userController.update.bind(userController)
);

router.delete('/:id', authorize(UserRole.ADMIN), userController.delete.bind(userController));

export default router;
