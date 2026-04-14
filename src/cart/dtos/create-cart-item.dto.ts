import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateCartItemDTO {
  @IsUUID('4')
  externalId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
