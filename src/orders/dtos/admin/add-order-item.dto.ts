import { IsInt, IsUUID, Min } from 'class-validator';

export class AddOrderItemDTO {
  @IsUUID()
  externalId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
