import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '@real-estate-analyzer/types';

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property street address',
    example: '123 Main Street',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Los Angeles',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    description: 'State abbreviation (2 letters)',
    example: 'CA',
    type: String,
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({
    description: '5-digit zip code',
    example: '90001',
    type: String,
    pattern: '^[0-9]{5}$',
  })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: PropertyType.RESIDENTIAL,
    enumName: 'PropertyType',
  })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    example: 3,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    example: 2,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Square footage of the property',
    example: 1500,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFeet?: number;

  @ApiPropertyOptional({
    description: 'Lot size in square feet',
    example: 5000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lotSize?: number;

  @ApiPropertyOptional({
    description: 'Year the property was built',
    example: 2020,
    type: Number,
    minimum: 1800,
    maximum: new Date().getFullYear(),
  })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearBuilt?: number;

  @ApiPropertyOptional({
    description: 'Purchase price of the property',
    example: 500000,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;
}
