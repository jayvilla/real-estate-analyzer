import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ValuationService } from './valuation.service';
import { DealService } from '../deal/deal.service';
import { PropertyService } from '../property/property.service';
import { ResourceNotFoundException } from '../common/errors/custom-exceptions';

@Controller('valuation')
export class ValuationController {
  constructor(
    private readonly valuationService: ValuationService,
    private readonly dealService: DealService,
    private readonly propertyService: PropertyService
  ) {}

  /**
   * Get valuation for a specific deal
   * GET /api/valuation/deals/:dealId
   */
  @Get('deals/:dealId')
  async getDealValuation(@Param('dealId', ParseUUIDPipe) dealId: string) {
    const deal = await this.dealService.findOne(dealId);
    return this.valuationService.calculateDealValuation(deal);
  }

  /**
   * Get valuation summary for a property (all deals)
   * GET /api/valuation/properties/:propertyId
   */
  @Get('properties/:propertyId')
  async getPropertyValuation(
    @Param('propertyId', ParseUUIDPipe) propertyId: string
  ) {
    const property = await this.propertyService.findOne(propertyId);
    const deals = await this.dealService.findByPropertyId(propertyId);

    return this.valuationService.calculatePropertyValuation(
      property.id,
      property.address,
      deals
    );
  }

  /**
   * Get specific metrics for a deal
   * GET /api/valuation/deals/:dealId/metrics?type=noi|cashflow|caprate|returns
   */
  @Get('deals/:dealId/metrics')
  async getDealMetrics(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Query('type') type?: string
  ) {
    const deal = await this.dealService.findOne(dealId);
    const valuation = this.valuationService.calculateDealValuation(deal);

    if (!type) {
      // Return all metrics
      return {
        noi: valuation.noi,
        cashFlow: valuation.cashFlow,
        capRate: valuation.capRate,
        returns: valuation.returns,
      };
    }

    // Return specific metric type
    switch (type.toLowerCase()) {
      case 'noi':
        return { noi: valuation.noi };
      case 'cashflow':
        return { cashFlow: valuation.cashFlow };
      case 'caprate':
        return { capRate: valuation.capRate };
      case 'returns':
        return { returns: valuation.returns };
      default:
        throw new ResourceNotFoundException('Metric type', type);
    }
  }
}

