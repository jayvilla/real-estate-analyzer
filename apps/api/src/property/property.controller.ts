import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new property',
    description: `
      Creates a new property in the system.
      
      **Property Types:**
      - residential: Single-family homes, condos, townhouses
      - commercial: Office buildings, retail spaces
      - multi_family: Apartment buildings, duplexes
      - land: Vacant land, lots
      - industrial: Warehouses, manufacturing facilities
      - mixed_use: Properties with multiple uses
      
      **Required Fields:**
      - address: Property street address
      - city: City name
      - state: State abbreviation (2 letters)
      - zipCode: 5-digit zip code
      - propertyType: Type of property
      
      **Optional Fields:**
      - bedrooms, bathrooms, squareFeet
      - lotSize, yearBuilt
      - description, notes
      
      Properties are automatically scoped to the authenticated user's organization.
    `,
  })
  @ApiBody({
    description: 'Property creation data',
    type: CreatePropertyDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Property created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zipCode: { type: 'string' },
        propertyType: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid property data or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.create(createPropertyDto, user.organizationId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all properties',
    description: `
      Retrieves all properties for the authenticated user's organization.
      
      **Query Parameters:**
      - includeDeals: Include associated deals in response (default: false)
      
      **Response:**
      - Returns array of properties
      - Each property includes basic information
      - Optionally includes related deals
      
      **Filtering:**
      Properties are automatically filtered by organization. Users only see properties
      belonging to their organization.
    `,
  })
  @ApiQuery({
    name: 'includeDeals',
    required: false,
    type: Boolean,
    description: 'Include associated deals in the response',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          zipCode: { type: 'string' },
          propertyType: { type: 'string' },
          bedrooms: { type: 'number', nullable: true },
          bathrooms: { type: 'number', nullable: true },
          squareFeet: { type: 'number', nullable: true },
          deals: {
            type: 'array',
            items: { type: 'object' },
            description: 'Associated deals (if includeDeals=true)',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(
    @Query('includeDeals') includeDeals?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    return this.propertyService.findAll(user.organizationId, includeDeals === 'true');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get property by ID',
    description: `
      Retrieves a specific property by its unique identifier.
      
      **Response Includes:**
      - Complete property details
      - Associated deals (if includeDeals=true)
      - Financial metrics (if calculated)
      - Valuation data (if available)
      
      **Error Responses:**
      - 404: Property not found or doesn't belong to user's organization
      - 401: Unauthorized access
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Property UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'includeDeals',
    required: false,
    type: Boolean,
    description: 'Include associated deals in the response',
  })
  @ApiResponse({
    status: 200,
    description: 'Property retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zipCode: { type: 'string' },
        propertyType: { type: 'string' },
        bedrooms: { type: 'number', nullable: true },
        bathrooms: { type: 'number', nullable: true },
        squareFeet: { type: 'number', nullable: true },
        lotSize: { type: 'number', nullable: true },
        yearBuilt: { type: 'number', nullable: true },
        description: { type: 'string', nullable: true },
        organizationId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deals: {
          type: 'array',
          items: { type: 'object' },
          description: 'Associated deals (if includeDeals=true)',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeals') includeDeals?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    return this.propertyService.findOne(id, user.organizationId, includeDeals === 'true');
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update property',
    description: `
      Updates an existing property. Only properties belonging to the user's organization
      can be updated.
      
      **Update Behavior:**
      - Partial updates supported (only send fields to update)
      - Validates all provided fields
      - Returns updated property
      
      **Immutable Fields:**
      - id: Cannot be changed
      - organizationId: Cannot be changed
      - createdAt: Cannot be changed
      
      **Validation:**
      - All field validations apply
      - Property must exist and belong to organization
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Property UUID to update',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    description: 'Property update data (partial)',
    type: UpdatePropertyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Property updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        address: { type: 'string' },
        // ... other property fields
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid update data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.update(id, updatePropertyDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete property',
    description: `
      Permanently deletes a property from the system.
      
      **Deletion Behavior:**
      - Property must belong to user's organization
      - Associated deals are NOT automatically deleted (cascade behavior configurable)
      - This action cannot be undone
      - Returns 204 No Content on success
      
      **Cascade Options:**
      - By default, deals remain but property reference is removed
      - Consider deleting or reassigning deals before property deletion
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Property UUID to delete',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Property deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.remove(id, user.organizationId);
  }
}
