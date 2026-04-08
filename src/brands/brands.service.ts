import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Brand } from 'src/entity';
import { BadRequestException, NotFoundException } from 'src/common';

import { AddBrandDTO, UpdateBrandDTO } from './dtos';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly repo: Repository<Brand>,
  ) {}

  getAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async getOne(id: number) {
    const brand = await this.repo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    return brand;
  }

  add(dto: AddBrandDTO) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateBrandDTO) {
    const brand = await this.getOne(id);
    Object.assign(brand, dto);

    return this.repo.save(brand);
  }

  async delete(id: number) {
    const brand = await this.findOneWithProductsOrFail(id);

    if (brand.products.length) throw new BadRequestException('products.brandHasProducts');

    await this.repo.remove(brand);

    return { deleted: true };
  }

  async findOneWithProductsOrFail(id: number, repo = this.repo) {
    const brand = await repo.findOne({ where: { id }, relations: { products: true } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    return brand;
  }
}
