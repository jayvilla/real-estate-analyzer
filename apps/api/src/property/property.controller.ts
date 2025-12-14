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
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.create(createPropertyDto, user.organizationId);
  }

  @Get()
  findAll(
    @Query('includeDeals') includeDeals?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    return this.propertyService.findAll(user.organizationId, includeDeals === 'true');
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeals') includeDeals?: string,
    @CurrentUser() user?: CurrentUserData
  ) {
    return this.propertyService.findOne(id, user.organizationId, includeDeals === 'true');
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.update(id, updatePropertyDto, user.organizationId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserData
  ) {
    return this.propertyService.remove(id, user.organizationId);
  }
}

