import { IsString } from 'class-validator';

export class ShippingFeesDTO {
  @IsString()
  cod: string;

  @IsString()
  dropOffCity: string;

  @IsString()
  pickupCity: string;
}
