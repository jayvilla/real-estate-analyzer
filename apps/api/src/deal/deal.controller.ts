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
  BadRequestException,
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
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Deals')
@Controller('deals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new deal',
    description: `
      Creates a new real estate deal analysis.
      
      **Deal Components:**
      
      **1. Purchase Information:**
      - propertyId: Associated property (required)
      - purchasePrice: Total purchase price
      - closingCosts: Estimated closing costs
      - rehabCosts: Renovation/repair costs
      
      **2. Financing Details:**
      - loanAmount: Mortgage loan amount
      - interestRate: Annual interest rate (as decimal, e.g., 0.045 for 4.5%)
      - loanTerm: Loan term in years (typically 15, 20, or 30)
      - loanType: Type of loan (conventional, FHA, VA, etc.)
      - downPayment: Down payment amount
      
      **3. Operating Assumptions:**
      - rentalIncome: Expected monthly rental income
      - operatingExpenses: Monthly operating expenses
      - vacancyRate: Expected vacancy rate (as percentage, e.g., 5 for 5%)
      - managementFee: Property management fee (as percentage)
      - appreciationRate: Expected annual appreciation rate
      
      **Deal Analysis:**
      Upon creation, the deal automatically calculates:
      - Cap Rate
      - Cash-on-Cash Return
      - DSCR (Debt Service Coverage Ratio)
      - NOI (Net Operating Income)
      - Cash Flow
      - ROI
      
      Deals are automatically scoped to the authenticated user's organization.
    `,
  })
  @ApiBody({
    description: 'Deal creation data',
    type: CreateDealDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Deal created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        propertyId: { type: 'string', format: 'uuid' },
        purchasePrice: { type: 'number' },
        financing: {
          type: 'object',
          properties: {
            loanAmount: { type: 'number' },
            interestRate: { type: 'number' },
            loanTerm: { type: 'number' },
            loanType: { type: 'string' },
          },
        },
        assumptions: {
          type: 'object',
          properties: {
            rentalIncome: { type: 'number' },
            operatingExpenses: { type: 'number' },
            vacancyRate: { type: 'number' },
          },
        },
        valuation: {
          type: 'object',
          description: 'Calculated valuation metrics',
          properties: {
            capRate: {
              type: 'object',
              properties: {
                rate: { type: 'number' },
                noi: { type: 'number' },
                purchasePrice: { type: 'number' },
              },
            },
            returnMetrics: {
              type: 'object',
              properties: {
                cashOnCashReturn: { type: 'number' },
                dscr: { type: 'number' },
                roi: { type: 'number' },
              },
            },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid deal data, missing property, or validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found or doesn\'t belong to organization',
  })
  create(
    @Body() createDealDto: CreateDealDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.create(createDealDto, user.organizationId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all deals',
    description: `
      Retrieves all deals for the authenticated user's organization.
      
      **Query Parameters:**
      - propertyId: Filter deals by property ID (optional)
      
      **Response:**
      - Returns array of deals
      - Each deal includes:
        - Deal details (purchase, financing, assumptions)
        - Calculated valuation metrics
        - Associated property information
        - Deal score (if calculated)
      
      **Filtering:**
      - If propertyId is provided, returns only deals for that property
      - Otherwise, returns all deals for the organization
      - Deals are automatically filtered by organization
    `,
  })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Filter deals by property ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Deals retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          purchasePrice: { type: 'number' },
          financing: { type: 'object' },
          assumptions: { type: 'object' },
          valuation: {
            type: 'object',
            description: 'Calculated financial metrics',
            properties: {
              capRate: { type: 'object' },
              returnMetrics: { type: 'object' },
              cashFlow: { type: 'object' },
            },
          },
          score: {
            type: 'object',
            nullable: true,
            description: 'Deal score (if calculated)',
            properties: {
              overallScore: { type: 'number' },
              criteria: { type: 'object' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findAll(
    @Query('propertyId') propertyId?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    if (propertyId) {
      // Validate that propertyId is a valid UUID string
      if (
        typeof propertyId !== 'string' ||
        propertyId === '[object Object]' ||
        propertyId.includes('object')
      ) {
        throw new BadRequestException(
          'Invalid propertyId: must be a valid UUID string'
        );
      }
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(propertyId)) {
        throw new BadRequestException(
          'Invalid propertyId: must be a valid UUID format'
        );
      }
      return this.dealService.findByPropertyId(propertyId, user.organizationId);
    }
    return this.dealService.findAll(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get deal by ID',
    description: `
      Retrieves a specific deal by its unique identifier.
      
      **Response Includes:**
      - Complete deal details
      - Purchase information
      - Financing details
      - Operating assumptions
      - Calculated valuation metrics
      - Deal score and history (if available)
      - Associated property information
      
      **Financial Metrics:**
      The deal includes automatically calculated metrics:
      - Cap Rate: NOI / Purchase Price
      - Cash-on-Cash Return: Annual Cash Flow / Total Cash Invested
      - DSCR: NOI / Annual Debt Service
      - ROI: Total Return / Total Investment
      - Cash Flow: NOI - Debt Service
      
      **Error Responses:**
      - 404: Deal not found or doesn't belong to user's organization
      - 401: Unauthorized access
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Deal UUID',
    type: String,
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Deal retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        propertyId: { type: 'string', format: 'uuid' },
        organizationId: { type: 'string', format: 'uuid' },
        purchasePrice: { type: 'number' },
        closingCosts: { type: 'number', nullable: true },
        rehabCosts: { type: 'number', nullable: true },
        financing: {
          type: 'object',
          properties: {
            loanAmount: { type: 'number' },
            interestRate: { type: 'number' },
            loanTerm: { type: 'number' },
            loanType: { type: 'string' },
            downPayment: { type: 'number' },
          },
        },
        assumptions: {
          type: 'object',
          properties: {
            rentalIncome: { type: 'number' },
            operatingExpenses: { type: 'number' },
            vacancyRate: { type: 'number' },
            managementFee: { type: 'number' },
            appreciationRate: { type: 'number', nullable: true },
          },
        },
        valuation: {
          type: 'object',
          properties: {
            capRate: {
              type: 'object',
              properties: {
                rate: { type: 'number' },
                noi: { type: 'number' },
                purchasePrice: { type: 'number' },
              },
            },
            returnMetrics: {
              type: 'object',
              properties: {
                cashOnCashReturn: { type: 'number' },
                dscr: { type: 'number' },
                roi: { type: 'number' },
                totalCashInvested: { type: 'number' },
                annualCashFlow: { type: 'number' },
              },
            },
            cashFlow: {
              type: 'object',
              properties: {
                monthly: { type: 'number' },
                annual: { type: 'number' },
              },
            },
          },
        },
        score: {
          type: 'object',
          nullable: true,
          properties: {
            overallScore: { type: 'number' },
            criteria: { type: 'object' },
            weights: { type: 'object' },
            calculatedAt: { type: 'string', format: 'date-time' },
          },
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Deal not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update deal',
    description: `
      Updates an existing deal. Only deals belonging to the user's organization
      can be updated.
      
      **Update Behavior:**
      - Partial updates supported (only send fields to update)
      - Validates all provided fields
      - Recalculates valuation metrics automatically
      - Returns updated deal with fresh calculations
      
      **Recalculation:**
      When deal data is updated, the following are automatically recalculated:
      - Cap Rate
      - Cash-on-Cash Return
      - DSCR
      - NOI
      - Cash Flow
      - ROI
      - Deal Score (if scoring is enabled)
      
      **Immutable Fields:**
      - id: Cannot be changed
      - organizationId: Cannot be changed
      - createdAt: Cannot be changed
      
      **Validation:**
      - All field validations apply
      - Deal must exist and belong to organization
      - Property must exist (if propertyId is being updated)
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Deal UUID to update',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    description: 'Deal update data (partial)',
    type: UpdateDealDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Deal updated successfully with recalculated metrics',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        // ... updated deal fields
        valuation: {
          type: 'object',
          description: 'Recalculated valuation metrics',
        },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Deal not found',
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
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.update(id, updateDealDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete deal',
    description: `
      Permanently deletes a deal from the system.
      
      **Deletion Behavior:**
      - Deal must belong to user's organization
      - Associated property is NOT deleted
      - Deal score history is preserved (if needed for analytics)
      - This action cannot be undone
      - Returns 204 No Content on success
      
      **Considerations:**
      - Review deal before deletion
      - Consider archiving instead of deleting for historical records
      - Deleted deals cannot be recovered
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Deal UUID to delete',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Deal deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Deal not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.remove(id, user.organizationId);
  }
}
