import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { OrdersModule } from 'src/orders';
import { AddressesModule } from 'src/addresses';

import { BostaService } from './bosta.service';

@Module({
  imports: [HttpModule, OrdersModule, forwardRef(() => AddressesModule)],
  providers: [BostaService],
  exports: [BostaService],
})
export class BostaModule {}
