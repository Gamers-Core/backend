import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

import { CheckoutOrderDTO } from './checkout-order.dto';

class VariantDTO {
  @IsUUID()
  externalId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDTO extends CheckoutOrderDTO {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantDTO)
  variants: VariantDTO[];
}
