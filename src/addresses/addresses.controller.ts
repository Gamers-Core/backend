import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';

import { CityDTO } from 'src/addresses/dtos/city.dto';
import { DistrictDTO } from 'src/addresses/dtos/district.dto';
import { ShippingFeesDTO } from 'src/addresses/dtos/shipping-fees.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { AddressesService } from './addresses.service';
import { BostaService } from './bosta/bosta.service';
import { CreateAddressDTO } from './dtos/admin/create-address.dto';
import { UpdateAddressDTO } from './dtos/admin/update-address.dto';
import { ShippingFeesResponseDTO } from './dtos/shipping-fees-response.dto';
import { AddressDTO } from './dtos/user/address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly bostaService: BostaService,
  ) {}

  @Serialize(AddressDTO)
  @Get()
  getAll(@CurrentUser() user: User) {
    return this.addressesService.getAll(user.id);
  }

  @Serialize(AddressDTO)
  @Post()
  add(@CurrentUser() user: User, @Body() body: CreateAddressDTO) {
    return this.addressesService.add(user.id, body);
  }

  @Serialize(AddressDTO)
  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateAddressDTO) {
    return this.addressesService.update(id, user.id, body);
  }

  @Serialize(AddressDTO)
  @Patch(':id/default')
  setDefault(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.setDefault(id, user.id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(id, user.id);
  }

  @Serialize(CityDTO)
  @Get('cities')
  getCities() {
    return this.bostaService.getCities();
  }

  @Serialize(DistrictDTO)
  @Get('cities/:id/districts')
  getDistricts(@Param('id') id: string) {
    return this.bostaService.getDistricts(id);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 60)
  @Get('insurance-fees/:amount')
  getInsuranceFees(@Param('amount', ParseIntPipe) amount: number) {
    return this.bostaService.getInsuranceFees(amount);
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1000 * 60 * 60)
  @Serialize(ShippingFeesResponseDTO)
  @Get('shipping-fees')
  getShippingFees(@Query() query: ShippingFeesDTO) {
    return this.bostaService.getShippingFees(query);
  }
}
