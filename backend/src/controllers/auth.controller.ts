import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dto/auth.dto';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDto = req.body;
      const { user, tokens } = await authService.register(data);

      res.status(201).json({
        user,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'bearer',
        expires_in: 900, // 15 minutes in seconds
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDto = req.body;
      const { user, tokens } = await authService.login(data);

      res.status(200).json({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'bearer',
        expires_in: 900,
        user,
      });
    } catch (error: any) {
      // Return 401 for invalid credentials
      const err: any = new Error(error.message);
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      next(err);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refresh_token }: RefreshTokenDto = req.body;
      const { accessToken } = await authService.refreshToken(refresh_token);

      res.status(200).json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 900,
      });
    } catch (error: any) {
      const err: any = new Error('Invalid refresh token');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      next(err);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // In a more advanced implementation, we would blacklist the token
      // For now, just return success (client will discard tokens)
      res.status(200).json({
        message: 'Successfully logged out',
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const user = await authService.getUserById(req.user.userId);

      if (!user) {
        const err: any = new Error('User not found');
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }

      res.status(200).json(user);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Forgot password - request reset token
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: ForgotPasswordDto = req.body;
      const { resetToken } = await authService.forgotPassword(email);

      // In production, this token would be emailed to the user
      // For development, we return it in the response
      res.status(200).json({
        message: 'Password reset email sent',
        // TODO: Remove this in production - only for development
        reset_token: resetToken || undefined,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, new_password }: ResetPasswordDto = req.body;
      await authService.resetPassword(token, new_password);

      res.status(200).json({
        message: 'Password successfully reset',
      });
    } catch (error: any) {
      const err: any = new Error(error.message);
      err.statusCode = 400;
      err.code = 'BAD_REQUEST';
      next(err);
    }
  }

  /**
   * Change password (authenticated user)
   * POST /api/users/me/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const { current_password, new_password }: ChangePasswordDto = req.body;
      await authService.changePassword(req.user.userId, current_password, new_password);

      res.status(200).json({
        message: 'Password successfully changed',
      });
    } catch (error: any) {
      const err: any = new Error(error.message);
      err.statusCode = 400;
      err.code = 'BAD_REQUEST';
      next(err);
    }
  }
}

export default new AuthController();
