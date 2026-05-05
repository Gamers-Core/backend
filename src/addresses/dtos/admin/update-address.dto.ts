import { PartialType } from 'src/common/partial-type';

import { CreateAddressDTO } from './create-address.dto';

export class UpdateAddressDTO extends PartialType(CreateAddressDTO) {}
