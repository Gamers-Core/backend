import { IsInt } from 'class-validator';

export class UpdateOrderItemDTO {
  @IsInt()
  quantity: number;
}
