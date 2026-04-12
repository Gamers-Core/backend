import { IsString, MinLength } from 'class-validator';

export class UpdateMeDTO {
  @IsString()
  @MinLength(2)
  name: string;
}
