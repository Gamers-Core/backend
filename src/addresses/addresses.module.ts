import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/entities/user.entity';

import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';
import { BostaService } from './bosta/bosta.service';
import { Address } from './entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User]), HttpModule, AuthModule],
  controllers: [AddressesController],
  providers: [AddressesService, BostaService],
  exports: [AddressesService, BostaService],
})
export class AddressesModule {}
