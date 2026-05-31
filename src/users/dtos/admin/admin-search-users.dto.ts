import { IsOptional, IsString } from 'class-validator';

export class AdminSearchUsersDTO {
  @IsOptional()
  @IsString()
  q?: string;
}
