import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { BostaController } from './bosta.controller';
import { BostaService } from './bosta.service';

@Module({
  imports: [HttpModule],
  controllers: [BostaController],
  providers: [BostaService],
})
export class BostaModule {}
