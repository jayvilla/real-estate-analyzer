import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    type: String,
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'securepassword123',
    type: String,
    format: 'password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  lastName!: string;

  @ApiPropertyOptional({
    description: 'Organization name (required for registration)',
    example: 'My Real Estate Company',
    type: String,
  })
  @IsOptional()
  @IsString()
  organizationName?: string;
}
