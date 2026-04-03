import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { paymentMethods, type PaymentMethod } from 'src/entity';

export class CheckoutOrderDTO {
  @IsString()
  @IsIn(paymentMethods)
  paymentMethod: PaymentMethod;

  @IsInt()
  @Min(1)
  addressId: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  canOpenPackage?: boolean;
}
