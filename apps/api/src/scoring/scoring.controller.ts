import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { DealService } from '../deal/deal.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { ScoringWeights } from '@real-estate-analyzer/types';

@Controller('scoring')
export class ScoringController {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly dealService: DealService
  ) {}

  @Post('deals/:dealId/calculate')
  async calculateDealScore(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @CurrentUser() user: CurrentUserData
  ) {
    const deal = await this.dealService.findOne(dealId, user.organizationId);
    return this.scoringService.calculateDealScore(deal, user.organizationId);
  }

  @Get('deals/:dealId')
  async getDealScore(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @CurrentUser() user: CurrentUserData
  ) {
    // Verify deal belongs to organization
    await this.dealService.findOne(dealId, user.organizationId);
    return this.scoringService.getDealScore(dealId);
  }

  @Get('deals/:dealId/history')
  async getDealScoreHistory(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @CurrentUser() user: CurrentUserData
  ) {
    // Verify deal belongs to organization
    await this.dealService.findOne(dealId, user.organizationId);
    return this.scoringService.getDealScoreHistory(dealId);
  }

  @Get('deals/compare')
  async compareDealScores(
    @Query('dealIds') dealIds: string,
    @CurrentUser() user: CurrentUserData
  ) {
    const dealIdArray = dealIds.split(',').filter((id) => id.trim());
    
    // Verify all deals belong to organization
    for (const dealId of dealIdArray) {
      await this.dealService.findOne(dealId.trim(), user.organizationId);
    }

    const scoreMap = await this.scoringService.compareDealScores(dealIdArray);
    
    // Convert Map to object for JSON response
    const result: Record<string, any> = {};
    scoreMap.forEach((score, dealId) => {
      result[dealId] = score;
    });
    
    return result;
  }

  @Get('configuration')
  async getScoringConfiguration(@CurrentUser() user: CurrentUserData) {
    return this.scoringService.getScoringWeights(user.organizationId);
  }

  @Post('configuration')
  async updateScoringConfiguration(
    @Body() weights: ScoringWeights,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.scoringService.updateScoringConfiguration(
      user.organizationId,
      weights
    );
  }
}

