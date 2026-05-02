import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { BostaService } from './bosta.service';

@Module({
  imports: [HttpModule],
  providers: [BostaService],
  exports: [BostaService],
})
export class BostaModule {}
