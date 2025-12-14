import { Module, forwardRef } from '@nestjs/common';
import { ValuationService } from './valuation.service';
import { ValuationController } from './valuation.controller';
import { DealModule } from '../deal/deal.module';
import { PropertyModule } from '../property/property.module';

@Module({
  imports: [
    forwardRef(() => DealModule), // Use forwardRef to avoid circular dependency
    PropertyModule,
  ],
  controllers: [ValuationController],
  providers: [ValuationService],
  exports: [ValuationService],
})
export class ValuationModule {}

