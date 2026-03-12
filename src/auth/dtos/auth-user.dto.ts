import { Expose } from 'class-transformer';
import { BasicUserDTO } from 'src/users';

export class AuthUserDTO extends BasicUserDTO {
  @Expose()
  isAdmin: boolean;

  @Expose()
  authId: string;
}
