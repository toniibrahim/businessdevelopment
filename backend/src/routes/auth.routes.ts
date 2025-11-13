import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';

const router = Router();

// Public routes
router.post('/register', validateDto(RegisterDto), authController.register.bind(authController));
router.post('/login', validateDto(LoginDto), authController.login.bind(authController));
router.post('/refresh', validateDto(RefreshTokenDto), authController.refresh.bind(authController));
router.post('/forgot-password', validateDto(ForgotPasswordDto), authController.forgotPassword.bind(authController));
router.post('/reset-password', validateDto(ResetPasswordDto), authController.resetPassword.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.get('/me', authenticate, authController.getMe.bind(authController));
router.post('/me/change-password', authenticate, validateDto(ChangePasswordDto), authController.changePassword.bind(authController));

export default router;
