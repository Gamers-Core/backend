import { PartialType } from 'src/common';

import { CreateAddressDTO } from './create-address.dto';

export class UpdateAddressDTO extends PartialType(CreateAddressDTO) {}
