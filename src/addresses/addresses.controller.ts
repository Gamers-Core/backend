import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { BostaService } from 'src/bosta/bosta.service';
import { CityDTO } from 'src/bosta/dtos/city.dto';
import { DistrictDTO } from 'src/bosta/dtos/district.dto';
import { ShippingFeesDTO } from 'src/bosta/dtos/shipping-fees.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { AddressesService } from './addresses.service';
import { AddressDTO } from './dtos/address.dto';
import { CreateAddressDTO } from './dtos/create-address.dto';
import { ShippingFeesResponseDTO } from './dtos/shipping-fees-response.dto';
import { UpdateAddressDTO } from './dtos/update-address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    private readonly bostaService: BostaService,
  ) {}

  @Serialize(AddressDTO)
  @Get()
  getAddresses(@CurrentUser() user: User) {
    return this.addressesService.getAddresses(user.id);
  }

  @Serialize(AddressDTO)
  @Post()
  addAddress(@CurrentUser() user: User, @Body() body: CreateAddressDTO) {
    return this.addressesService.addAddress(user.id, body);
  }

  @Serialize(AddressDTO)
  @Patch(':id')
  updateAddress(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateAddressDTO) {
    return this.addressesService.updateAddress(id, user.id, body);
  }

  @Serialize(AddressDTO)
  @Patch(':id/default')
  setDefaultAddress(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.setDefaultAddress(id, user.id);
  }

  @Delete(':id')
  deleteAddress(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.removeAddress(id, user.id);
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

  @Get('insurance-fees/:amount')
  getInsuranceFees(@Param('amount', ParseIntPipe) amount: number) {
    return this.bostaService.getInsuranceFees(amount);
  }

  @Serialize(ShippingFeesResponseDTO)
  @Get('shipping-fees')
  getShippingFees(@Query() query: ShippingFeesDTO) {
    return this.bostaService.getShippingFees(query);
  }
}
