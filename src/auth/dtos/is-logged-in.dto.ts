import { Expose } from 'class-transformer';

export class IsLoggedInDTO {
  @Expose()
  isLoggedIn: boolean;
}
