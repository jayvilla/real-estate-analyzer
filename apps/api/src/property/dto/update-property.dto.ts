import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @ApiPropertyOptional({
    description: 'Current estimated value of the property',
    example: 550000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentValue?: number;
}
