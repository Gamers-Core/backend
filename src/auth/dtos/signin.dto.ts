import { IsEmail } from 'class-validator';

export class SigninDTO {
  @IsEmail()
  email: string;
}
