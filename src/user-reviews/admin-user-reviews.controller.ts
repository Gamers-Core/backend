import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';

import { IsAdminAuthGuard } from 'src/guards';
import { Serialize } from 'src/interceptors';

import { UserReviewsService } from './user-reviews.service';
import { AddUserReviewDTO, AdminUserReviewDTO, ReorderUserReviewsDTO, UpdateUserReviewDTO } from './dto';

@Controller('admin/user-reviews')
@UseGuards(IsAdminAuthGuard)
export class AdminUserReviewsController {
  constructor(private readonly userReviewsService: UserReviewsService) {}

  @Get()
  @Serialize(AdminUserReviewDTO)
  getAll() {
    return this.userReviewsService.getAll();
  }

  @Post()
  @Serialize(AdminUserReviewDTO)
  add(@Body() dto: AddUserReviewDTO) {
    return this.userReviewsService.add(dto);
  }

  @Patch('reorder')
  @Serialize(AdminUserReviewDTO)
  reorder(@Body() dto: ReorderUserReviewsDTO) {
    return this.userReviewsService.reorder(dto.ids);
  }

  @Patch(':position')
  @Serialize(AdminUserReviewDTO)
  update(@Param('position', ParseIntPipe) position: number, @Body() dto: UpdateUserReviewDTO) {
    return this.userReviewsService.update(position, dto);
  }

  @Delete(':position')
  @Serialize(AdminUserReviewDTO)
  async delete(@Param('position', ParseIntPipe) position: number) {
    return this.userReviewsService.delete(position);
  }
}
