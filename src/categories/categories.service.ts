import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';

import { AddCategoryDTO } from './dtos/add-category.dto';
import { UpdateCategoryDTO } from './dtos/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  getAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async getOne(id: number) {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('products.categoryNotFound');

    return category;
  }

  add(dto: AddCategoryDTO) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateCategoryDTO) {
    const category = await this.getOne(id);
    Object.assign(category, dto);

    return this.repo.save(category);
  }

  async delete(id: number) {
    const category = await this.findOneWithProductsOrFail(id);

    if (category.products.length) throw new BadRequestException('products.categoryHasProducts');

    await this.repo.remove(category);

    return { deleted: true };
  }

  private async findOneWithProductsOrFail(id: number, repo = this.repo) {
    const category = await repo.findOne({ where: { id }, relations: { products: true } });
    if (!category) throw new NotFoundException('products.categoryNotFound');

    return category;
  }
}
