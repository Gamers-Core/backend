import { Expose, Type } from 'class-transformer';

import { AddressDTO } from 'src/addresses';

import { BasicUserDTO } from './basic-user.dto';

export class FullUserDTO extends BasicUserDTO {
  @Expose()
  @Type(() => AddressDTO)
  addresses: AddressDTO[];
}
