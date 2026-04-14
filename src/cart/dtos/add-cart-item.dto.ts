import { IsInt, Min } from 'class-validator';

export class AddCartItemDTO {
  @IsInt()
  @Min(1)
  quantity: number;
}
