import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { AuthResponse } from '@real-estate-analyzer/types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: `
      Authenticates a user and returns a JWT access token.
      
      **Steps to use in Swagger:**
      1. Click "Try it out" on this endpoint
      2. Enter your email and password
      3. Click "Execute"
      4. Copy the "accessToken" from the response
      5. Click the "Authorize" button at the top of the Swagger page
      6. Paste the token (you can paste just the token, or "Bearer <token>")
      7. Click "Authorize" then "Close"
      8. Now all protected endpoints will use this token automatically
      
      **Token Format:**
      - You can paste just the token: \`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
      - Or with Bearer prefix: \`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\`
      - Both formats work, but just the token is simpler
      
      **Token Expiration:**
      - Tokens expire after the configured time (default: 24 hours)
      - You'll need to login again when the token expires
    `,
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'User email address',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'password123',
          description: 'User password',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Returns JWT access token',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token to use for authenticated requests',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            organizationId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: `
      Registers a new user account and returns a JWT access token.
      
      **Registration Process:**
      1. Creates a new user account
      2. Creates a default organization for the user
      3. Returns JWT token (same as login)
      4. User is automatically logged in
      
      **After Registration:**
      - Copy the accessToken from the response
      - Use the "Authorize" button in Swagger to set the token
      - See login endpoint documentation for token usage instructions
      
      **Required Fields:**
      - email: Valid email address
      - password: Minimum 8 characters
      - firstName: User's first name
      - lastName: User's last name
      - organizationName: Name for the organization (currently required)
      
      **Example Request:**
      \`\`\`json
      {
        "email": "user@example.com",
        "password": "securepassword123",
        "firstName": "John",
        "lastName": "Doe",
        "organizationName": "My Company"
      }
      \`\`\`
    `,
  })
  @ApiBody({
    description: 'Registration data',
    schema: {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
          description: 'User email address',
        },
        password: {
          type: 'string',
          format: 'password',
          example: 'securepassword123',
          minLength: 8,
          description: 'User password (minimum 8 characters)',
        },
        firstName: {
          type: 'string',
          example: 'John',
          minLength: 1,
          description: 'User first name',
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          minLength: 1,
          description: 'User last name',
        },
        organizationName: {
          type: 'string',
          example: 'My Real Estate Company',
          description: 'Optional organization name (required for registration)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful - Returns JWT access token',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'JWT access token',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            name: { type: 'string' },
            organizationId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or user already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }
}
