import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { MarketDataEntity } from './entities/market-data.entity';
import { MarketAlertEntity } from './entities/market-alert.entity';
import { PropertyModule } from '../property/property.module';
import { DealModule } from '../deal/deal.module';
import { LoggingModule } from '../common/logging/logging.module';
import { MockMarketDataProvider } from './providers/market-data.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketDataEntity, MarketAlertEntity]),
    forwardRef(() => PropertyModule),
    forwardRef(() => DealModule),
    LoggingModule,
  ],
  controllers: [MarketController],
  providers: [
    MarketService,
    {
      provide: 'IMarketDataProvider',
      useClass: MockMarketDataProvider,
    },
  ],
  exports: [MarketService],
})
export class MarketModule {}

