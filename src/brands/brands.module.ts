import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Brand } from 'src/entity';

import { AdminBrandsController } from './admin-brands.controller';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
