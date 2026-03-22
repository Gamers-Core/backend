import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateCartItemDTO {
  @IsUUID('4')
  variantExternalId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
