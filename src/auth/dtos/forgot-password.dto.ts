import { IsEmail, IsStrongPassword } from 'class-validator';

export class ForgotPasswordDTO {
  @IsEmail()
  email: string;
  @IsStrongPassword({ minLength: 6 })
  password: string;
}
