import { Expose, Transform } from 'class-transformer';

export class ShippingFeesResponseDTO {
  @Expose()
  @Transform(({ obj }) => obj.tier.openingPackageFee.amount ?? 0)
  openingFee: number;

  @Expose()
  @Transform(({ obj }) => obj.extraCodFee?.amount ?? 0)
  codFee: number;

  @Expose()
  shippingFee: number;
}
