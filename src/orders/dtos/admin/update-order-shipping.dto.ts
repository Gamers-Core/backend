import { IsString, MaxLength } from 'class-validator';

export class UpdateOrderShippingDTO {
  @IsString()
  @MaxLength(255)
  trackingNumber: string;
}
