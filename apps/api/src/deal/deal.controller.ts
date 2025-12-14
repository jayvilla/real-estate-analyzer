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

@Controller('deals')
export class DealController {
  constructor(private readonly dealService: DealService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDealDto: CreateDealDto) {
    return this.dealService.create(createDealDto);
  }

  @Get()
  findAll(@Query('propertyId') propertyId?: string) {
    if (propertyId) {
      return this.dealService.findByPropertyId(propertyId);
    }
    return this.dealService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto
  ) {
    return this.dealService.update(id, updateDealDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealService.remove(id);
  }
}

