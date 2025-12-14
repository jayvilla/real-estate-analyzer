import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { OrganizationService } from '../organization/organization.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload, UserRole } from '@real-estate-analyzer/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly organizationService: OrganizationService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLoggerService
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.warn(
        `Login attempt with non-existent email: ${loginDto.email}`,
        'AuthService',
        { email: loginDto.email }
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(
        `Login attempt for inactive user: ${user.id}`,
        'AuthService',
        { userId: user.id, email: loginDto.email }
      );
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await this.userService.validatePassword(user, loginDto.password);

    if (!isPasswordValid) {
      this.logger.warn(
        `Invalid password attempt for user: ${user.id}`,
        'AuthService',
        { userId: user.id, email: loginDto.email }
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.logWithMetadata(
      'info',
      `User logged in successfully: ${user.id}`,
      { userId: user.id, email: user.email, organizationId: user.organizationId },
      'AuthService'
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        organization: user.organization!,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    let organizationId: string;

    // Create organization if provided, otherwise use default (for now, we'll require it)
    if (registerDto.organizationName) {
      const organization = await this.organizationService.create(registerDto.organizationName);
      organizationId = organization.id;
    } else {
      // For now, throw error if no organization name provided
      // In production, you might want a default organization or different flow
      throw new UnauthorizedException('Organization name is required for registration');
    }

    // Create user with USER role by default
    const user = await this.userService.create(
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
      organizationId,
      UserRole.USER
    );

    // Fetch user with organization relation
    const userWithOrg = await this.userService.findById(user.id);
    if (!userWithOrg) {
      throw new UnauthorizedException('Failed to create user');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.logWithMetadata(
      'info',
      `User registered successfully: ${user.id}`,
      { userId: user.id, email: user.email, organizationId },
      'AuthService'
    );

    return {
      accessToken,
      user: {
        id: userWithOrg.id,
        email: userWithOrg.email,
        firstName: userWithOrg.firstName,
        lastName: userWithOrg.lastName,
        role: userWithOrg.role,
        organizationId: userWithOrg.organizationId,
        isActive: userWithOrg.isActive,
        createdAt: userWithOrg.createdAt,
        updatedAt: userWithOrg.updatedAt,
        organization: userWithOrg.organization!,
      },
    };
  }

  async validateUser(userId: string) {
    return this.userService.findById(userId);
  }
}

