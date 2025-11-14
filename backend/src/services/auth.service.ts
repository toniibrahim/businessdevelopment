import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.util';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.util';
import crypto from 'crypto';

const userRepository = AppDataSource.getRepository(User);

export interface RegisterUserDto {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  team_id?: string;
  role?: UserRole;
}

export interface LoginDto {
  username: string;
  password: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterUserDto): Promise<{ user: User; tokens: any }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already in use');
      }
      throw new Error('Username already in use');
    }

    // Hash password
    const password_hash = await hashPassword(data.password);

    // Create user
    const user = userRepository.create({
      ...data,
      password_hash,
      role: data.role || UserRole.SALES,
      is_active: true,
    });

    await userRepository.save(user);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    delete (user as any).password_hash;

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<{ user: User; tokens: any }> {
    // Find user by username or email
    const user = await userRepository.findOne({
      where: [{ username: data.username }, { email: data.username }],
      relations: ['team'],
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date();
    await userRepository.save(user);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    delete (user as any).password_hash;

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await userRepository.findOne({
        where: { id: payload.userId, is_active: true },
      });

      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Generate new access token
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken: tokens.accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['team'],
    });

    if (user) {
      delete (user as any).password_hash;
    }

    return user;
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return { resetToken: '' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token expiration (1 hour)
    user.reset_password_token = hashedToken;
    user.reset_password_expires = new Date(Date.now() + 3600000);

    await userRepository.save(user);

    // TODO: Send email with reset token
    // For now, return the token (in production, this would be emailed)
    return { resetToken };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await userRepository
      .createQueryBuilder('user')
      .where('user.reset_password_token = :token', { token: hashedToken })
      .andWhere('user.reset_password_expires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    user.password_hash = await hashPassword(newPassword);
    user.reset_password_token = null as any;
    user.reset_password_expires = null as any;

    await userRepository.save(user);
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash and save new password
    user.password_hash = await hashPassword(newPassword);
    await userRepository.save(user);
  }
}

export default new AuthService();
