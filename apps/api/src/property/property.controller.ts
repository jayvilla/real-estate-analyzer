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
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.create(createPropertyDto);
  }

  @Get()
  findAll(@Query('includeDeals') includeDeals?: string) {
    return this.propertyService.findAll(includeDeals === 'true');
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeals') includeDeals?: string
  ) {
    return this.propertyService.findOne(id, includeDeals === 'true');
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.propertyService.remove(id);
  }
}

