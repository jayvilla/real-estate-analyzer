export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  currentValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PropertyType {
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  MULTI_FAMILY = 'MULTI_FAMILY',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
}

export interface CreatePropertyDto {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice?: number;
}

export interface UpdatePropertyDto {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  purchasePrice?: number;
  currentValue?: number;
}

