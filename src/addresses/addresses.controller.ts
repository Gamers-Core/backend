import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';
import { BostaService, CityDTO, DistrictDTO, ShippingFeesDTO } from 'src/bosta';

import { CurrentUser } from 'src/users/decorators/current-user.decorator';

import { AddressDTO, CreateAddressDTO, ShippingFeesResponseDTO, UpdateAddressDTO } from './dtos';
import { AddressesService } from './addresses.service';

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
