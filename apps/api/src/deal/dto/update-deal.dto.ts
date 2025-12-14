import { PartialType } from '@nestjs/swagger';
import { CreateDealDto } from './create-deal.dto';

export class UpdateDealDto extends PartialType(CreateDealDto) {
  // propertyId should not be updatable
}
