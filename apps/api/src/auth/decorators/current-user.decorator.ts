import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';

export interface CurrentUserData {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
  user: UserEntity;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

