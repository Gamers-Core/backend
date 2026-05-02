import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsRelations, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { AddCategoryDTO } from './dtos/admin/add-category.dto';
import { UpdateCategoryDTO } from './dtos/admin/update-category.dto';
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

  getOne(id: number) {
    return this.findOneOrFail(id);
  }

  async add(dto: AddCategoryDTO) {
    const category = await this.repo.save(this.repo.create(dto));

    return this.findOneOrFail(category.id);
  }

  async update(id: number, dto: UpdateCategoryDTO) {
    const result = await this.repo.update(id, dto);
    if (!result.affected) throw NotFoundException('products.categoryNotFound');

    return this.findOneOrFail(id);
  }

  async delete(id: number) {
    const category = await this.findOneOrFail(id, undefined, { products: true });
    if (category.products.length) throw BadRequestException('products.categoryHasProducts');

    await this.repo.delete(id);

    return { deleted: true };
  }

  private async findOneOrFail(id: number, manager?: EntityManager, relations?: FindOptionsRelations<Category>) {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(Category);

      const category = await repo.findOne({ where: { id }, relations });
      if (!category) throw NotFoundException('products.categoryNotFound');

      return category;
    });
  }
}
