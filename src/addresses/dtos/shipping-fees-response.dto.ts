import { Expose } from 'class-transformer';

export class ShippingFeesResponseDTO {
  @Expose()
  openingFee: number;

  @Expose()
  codFee: number;

  @Expose()
  shippingFee: number;
}
