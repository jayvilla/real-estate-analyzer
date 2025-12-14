/**
 * Authentication and Authorization Types
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organization?: Organization;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName?: string; // Optional, creates new org if provided
}

export interface AuthResponse {
  accessToken: string;
  user: Omit<User, 'organization'> & { organization: Organization };
}

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  organizationId: string;
  iat?: number;
  exp?: number;
}

