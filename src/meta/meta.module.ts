import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { MetaService } from './meta.service';

@Module({
  imports: [HttpModule],
  providers: [MetaService],
  exports: [MetaService],
})
export class MetaModule {}
