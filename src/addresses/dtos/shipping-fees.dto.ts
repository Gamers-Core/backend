import { IsOptional, IsString } from 'class-validator';

export class ShippingFeesDTO {
  @IsString()
  cod: string;

  @IsString()
  dropOffCity: string;

  @IsString()
  @IsOptional()
  pickupCity?: string;
}
