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
} from '@nestjs/common';
import { DealService } from './deal.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDealDto: CreateDealDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.create(createDealDto, user.organizationId);
  }

  @Get()
  findAll(
    @Query('propertyId') propertyId?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    if (propertyId) {
      return this.dealService.findByPropertyId(propertyId, user.organizationId);
    }
    return this.dealService.findAll(user.organizationId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.update(id, updateDealDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.dealService.remove(id, user.organizationId);
  }
}

