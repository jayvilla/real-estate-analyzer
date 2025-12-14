import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import {
  MarketTrend,
  NeighborhoodAnalysis,
  RentalMarketTrend,
  AppreciationPrediction,
  ComparativeMarketAnalysis,
  MarketHeatMapData,
  MarketAlert,
  MarketAnalysisOptions,
} from '@real-estate-analyzer/types';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('trends/:zipCode')
  async getMarketTrend(
    @Param('zipCode') zipCode: string,
    @Query() options: MarketAnalysisOptions
  ): Promise<MarketTrend> {
    return this.marketService.getMarketTrend(zipCode, options);
  }

  @Get('neighborhood/:zipCode')
  async getNeighborhoodAnalysis(
    @Param('zipCode') zipCode: string
  ): Promise<NeighborhoodAnalysis> {
    return this.marketService.getNeighborhoodAnalysis(zipCode);
  }

  @Get('rental/:zipCode')
  async getRentalMarketTrend(
    @Param('zipCode') zipCode: string
  ): Promise<RentalMarketTrend> {
    return this.marketService.getRentalMarketTrend(zipCode);
  }

  @Get('appreciation/:zipCode')
  async getAppreciationPrediction(
    @Param('zipCode') zipCode: string,
    @Query('currentValue') currentValue: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<AppreciationPrediction> {
    return this.marketService.getAppreciationPrediction(
      zipCode,
      parseFloat(currentValue)
    );
  }

  @Get('cma/:propertyId')
  async generateCMA(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<ComparativeMarketAnalysis> {
    return this.marketService.generateCMA(propertyId, user.organizationId);
  }

  @Get('heatmap')
  async getMarketHeatMap(
    @Query('state') state?: string,
    @Query('city') city?: string,
    @CurrentUser() user?: CurrentUserData
  ): Promise<MarketHeatMapData[]> {
    return this.marketService.getMarketHeatMap(
      user?.organizationId || '',
      state,
      city
    );
  }

  @Get('alerts')
  async getMarketAlerts(
    @Query('isRead') isRead?: string,
    @CurrentUser() user?: CurrentUserData
  ): Promise<MarketAlert[]> {
    return this.marketService.getMarketAlerts(
      user?.organizationId || '',
      user?.userId || '',
      isRead === 'true' ? true : isRead === 'false' ? false : undefined
    );
  }

  @Post('alerts/check/:zipCode')
  async checkAndCreateAlerts(
    @Param('zipCode') zipCode: string,
    @CurrentUser() user: CurrentUserData
  ): Promise<MarketAlert[]> {
    return this.marketService.checkAndCreateAlerts(
      user.organizationId,
      user.userId,
      zipCode
    );
  }
}

