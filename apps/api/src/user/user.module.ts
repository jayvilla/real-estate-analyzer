import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { OrganizationModule } from '../organization/organization.module';
import { LoggingModule } from '../common/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    OrganizationModule,
    LoggingModule,
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

