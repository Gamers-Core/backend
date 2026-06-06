import { IsIn, IsOptional, IsString } from 'class-validator';

import { adminSortUserOptions } from 'src/users/const';
import type { AdminSortUserOption } from 'src/users/types';

export class AdminSearchUsersDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(adminSortUserOptions)
  sort?: AdminSortUserOption;
}
