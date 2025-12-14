import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { OrganizationService } from '../organization/organization.service';
import { StructuredLoggerService } from '../common/logging/structured-logger.service';
import { UserRole } from '@real-estate-analyzer/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly organizationService: OrganizationService,
    private readonly logger: StructuredLoggerService
  ) {}

  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationId: string,
    role: UserRole = UserRole.USER
  ): Promise<UserEntity> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    // Verify organization exists
    await this.organizationService.findByIdOrFail(organizationId);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      organizationId,
      role,
    });

    const saved = await this.userRepository.save(user);

    this.logger.logWithMetadata(
      'info',
      `Created user: ${saved.id}`,
      { userId: saved.id, email, organizationId, role },
      'UserService'
    );

    return saved;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
  }

  async findByIdOrFail(id: string): Promise<UserEntity> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async validatePassword(user: UserEntity, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateRole(userId: string, role: UserRole): Promise<UserEntity> {
    const user = await this.findByIdOrFail(userId);
    user.role = role;
    return this.userRepository.save(user);
  }

  async deactivateUser(userId: string): Promise<UserEntity> {
    const user = await this.findByIdOrFail(userId);
    user.isActive = false;
    return this.userRepository.save(user);
  }
}

