import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { User } from 'src/entity';
import { Serialize } from 'src/interceptors';
import { CurrentUser } from 'src/users';

import { AddressDTO, CreateAddressDTO, UpdateAddressDTO } from './dtos';
import { AddressesService } from './addresses.service';

@Controller('me/addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

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
  updateAddress(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAddressDTO,
  ) {
    return this.addressesService.updateAddress(id, user.id, body);
  }

  @Serialize(AddressDTO)
  @Patch(':id/default')
  setDefaultAddress(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.setDefaultAddress(id, user.id);
  }

  @Delete(':id')
  deleteAddress(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.addressesService.removeAddress(id, user.id);
  }
}
