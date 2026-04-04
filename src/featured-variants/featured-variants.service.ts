import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';

import { FeaturedVariant, Variant } from 'src/entity';
import { BadRequestException, ConflictException, NotFoundException } from 'src/common';

import { AddFeaturedVariantDTO, UpdateFeaturedVariantDTO } from './dtos';

@Injectable()
export class FeaturedVariantsService {
  constructor(
    @InjectRepository(FeaturedVariant)
    private readonly repo: Repository<FeaturedVariant>,
    @InjectRepository(Variant)
    private readonly variantRepo: Repository<Variant>,
  ) {}

  getAll() {
    return this.repo.find({
      order: { position: 'ASC' },
      relations: { variant: { product: true } },
      where: { variant: { deletedAt: IsNull() } },
    });
  }

  async add(dto: AddFeaturedVariantDTO) {
    const variant = await this.variantRepo.findOne({ where: { id: dto.variantId, isActive: true } });
    if (!variant) throw new NotFoundException('products.variantNotFound');

    const existing = await this.repo.findOne({ where: { variant: { id: dto.variantId } } });
    if (existing) throw new ConflictException('featuredVariants.alreadyFeatured');

    const maxRaw = await this.repo
      .createQueryBuilder('featuredVariant')
      .select('MAX(featuredVariant.position)', 'max')
      .getRawOne<{ max: string | null }>();
    const maxPosition = Number(maxRaw?.max) || 0;

    const saved = await this.repo.save(
      this.repo.create({
        ...dto,
        variant: { id: dto.variantId },
        position: maxPosition + 1,
      }),
    );

    return this.findOneWithRelationsOrFail(saved.id);
  }

  async update(id: number, { variantId, ...dto }: UpdateFeaturedVariantDTO) {
    const featured = await this.repo.findOne({ where: { id } });
    if (!featured) throw new NotFoundException('featuredVariants.notFound');

    Object.assign(featured, dto);
    if (variantId) {
      const variant = await this.variantRepo.findOne({ where: { id: variantId, isActive: true, deletedAt: IsNull() } });
      if (!variant) throw new NotFoundException('products.variantNotFound');

      const existing = await this.repo.findOne({ where: { variant: { id: variantId } } });
      if (existing && existing.id !== id) throw new ConflictException('featuredVariants.alreadyFeatured');

      featured.variant = variant;
    }

    const saved = await this.repo.save(featured);

    return this.findOneWithRelationsOrFail(saved.id);
  }

  async remove(id: number) {
    const featured = await this.repo.findOne({ where: { id } });
    if (!featured) throw new NotFoundException('featuredVariants.notFound');

    await this.repo.remove(featured);

    return { deleted: true };
  }

  async reorder(orderedIds: number[]) {
    const featured = await this.repo.find({ where: { id: In(orderedIds) } });

    if (featured.length !== orderedIds.length) throw new BadRequestException('featuredVariants.invalidIds');

    await this.repo.save(
      orderedIds.map((id, index) => {
        const item = featured.find((entry) => entry.id === id)!;
        item.position = index + 1;

        return item;
      }),
    );

    return { updated: true };
  }

  private async findOneWithRelationsOrFail(id: number) {
    const featured = await this.repo.findOne({
      where: { id, variant: { deletedAt: IsNull() } },
      relations: { variant: { product: true } },
    });

    if (!featured) throw new NotFoundException('featuredVariants.notFound');

    return featured;
  }
}
