import { IsIn, IsOptional, IsString } from 'class-validator';

import { PaginatedDTO } from 'src/common/pagination/pagination.dto';
import { adminSortUserOptions } from 'src/users/const';
import type { AdminSortUserOption } from 'src/users/types';

export class AdminSearchUsersDTO extends PaginatedDTO {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(adminSortUserOptions)
  sort?: AdminSortUserOption;
}
