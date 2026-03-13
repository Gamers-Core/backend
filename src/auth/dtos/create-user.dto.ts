import { IsStrongPassword } from 'class-validator';

import { UpdateUserDTO } from './update-user.dto';

export class CreateUserDTO extends UpdateUserDTO {
  @IsStrongPassword({ minLength: 6 })
  password: string;
}
