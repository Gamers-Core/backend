import { IsInt, IsUUID, Min } from 'class-validator';

export class SyncCartItemDTO {
  @IsUUID('4')
  externalId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
