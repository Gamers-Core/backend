import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Brand, Category, Product, Variant } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { NotFoundException } from 'src/common';

import { CreateProductDTO, UpdateProductDTO } from '../dtos/admin';
import { productFullRelations } from '../relations';
import { VariantsService } from './variants.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly mediaAttachmentService: MediaAttachmentService,
    private readonly variants: VariantsService,
  ) {}

  async create({ brandId, categoryId, mediaIds, variants, ...dto }: CreateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const brandRepo = manager.getRepository(Brand);
      const categoryRepo = manager.getRepository(Category);

      const [brand, category] = await Promise.all([
        this.resolveBrand(brandId, brandRepo),
        this.resolveCategory(categoryId, categoryRepo),
      ]);

      const product = await productRepo.save(productRepo.create({ ...dto, brand, category }));

      await this.variants.add(product.id, variants, manager);

      if (mediaIds !== undefined)
        await this.mediaAttachmentService.sync({ entityId: product.id, entityType: 'product', mediaIds }, manager);

      return this.findOneWithMediaOrFail(product.id, productRepo);
    });
  }

  async findAll() {
    const products = await this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: productFullRelations,
    });

    const variantIds = products.flatMap((product) => product.variants.map((variant) => variant.id));

    const [mediaMap, variantMediaMap] = await Promise.all([
      this.mediaAttachmentService.getBulkMedia(
        products.map(({ id }) => id),
        'product',
      ),
      this.mediaAttachmentService.getBulkMedia(variantIds, 'variant'),
    ]);

    const productsWithMedia = products.map((product) => {
      const variants = product.variants.map((variant) => ({ ...variant, media: variantMediaMap[variant.id] ?? [] }));

      return { ...product, variants, media: mediaMap[product.id] ?? [] };
    });

    return productsWithMedia;
  }

  async findOne(id: number) {
    return this.findOneWithMediaOrFail(id);
  }

  async update(id: number, { mediaIds, brandId, categoryId, ...dto }: UpdateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      const product = await this.findOneOrFail(id, productRepo);

      if (mediaIds !== undefined)
        await this.mediaAttachmentService.sync({ entityId: id, entityType: 'product', mediaIds }, manager);

      Object.assign(product, dto);

      if (brandId) {
        const brandRepo = manager.getRepository(Brand);
        product.brand = await this.resolveBrand(brandId, brandRepo);
      }

      if (categoryId) {
        const categoryRepo = manager.getRepository(Category);
        product.category = await this.resolveCategory(categoryId, categoryRepo);
      }

      await productRepo.save(product);

      return this.findOneWithMediaOrFail(id, productRepo);
    });
  }

  async delete(id: number): Promise<void> {
    await this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      await this.mediaAttachmentService.sync({ entityId: id, entityType: 'product', mediaIds: [] }, manager);

      const product = await this.findOneOrFail(id, productRepo);
      await Promise.all(
        product.variants.map(async (variant) =>
          this.mediaAttachmentService.sync({ entityId: variant.id, entityType: 'variant', mediaIds: [] }, manager),
        ),
      );

      await productRepo.delete(id);
    });
  }

  async getRecommendations(productId: number): Promise<Product[]> {
    const product = await this.findOneOrFail(productId);

    const recommendations = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variant')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id != :productId', { productId })
      .andWhere('product.status = :status', { status: 'active' })
      .andWhere(
        new Brackets((qb) => {
          qb.where('brand.id = :brandId', { brandId: product.brand.id }).orWhere('category.id = :categoryId', {
            categoryId: product.category.id,
          });
        }),
      )
      .andWhere((qb) => {
        const sub = qb
          .subQuery()
          .select('1')
          .from(Variant, 'v')
          .where('"v"."product_id" = "product"."id"')
          .andWhere('"v"."is_active" = :active', { active: true })
          .andWhere('"v"."stock" > 0')
          .andWhere('"v"."deleted_at" IS NULL')
          .getQuery();
        return `EXISTS ${sub}`;
      })
      .orderBy(
        `
      CASE
        WHEN brand.id = :brandId AND category.id = :categoryId THEN 0
        WHEN brand.id = :brandId OR category.id = :categoryId THEN 1
        ELSE 2
      END
    `,
        'ASC',
      )
      .addOrderBy('RANDOM()')
      .limit(4)
      .getMany();

    const media = await this.mediaAttachmentService.getBulkMedia(
      recommendations.map(({ id }) => id),
      'product',
    );

    return recommendations.map((recommendation) => ({ ...recommendation, media: media[recommendation.id] ?? [] }));
  }

  private async findOneWithMediaOrFail(id: number, productRepository: Repository<Product> = this.productsRepository) {
    const product = await this.findOneOrFail(id, productRepository);

    const [media, variantMediaMap] = await Promise.all([
      this.mediaAttachmentService.getMedia({ entityId: product.id, entityType: 'product' }),
      this.mediaAttachmentService.getBulkMedia(
        product.variants.map(({ id }) => id),
        'variant',
      ),
    ]);

    const variants = product.variants.map((variant) => ({ ...variant, media: variantMediaMap[variant.id] ?? [] }));

    return { ...product, variants, media };
  }

  private async findOneOrFail(
    id: number,
    productRepository: Repository<Product> = this.productsRepository,
  ): Promise<Product> {
    const product = await productRepository.findOne({
      where: { id },
      relations: productFullRelations,
    });

    if (!product) throw new NotFoundException('products.productNotFound');

    return product;
  }

  private async resolveBrand(brandId: number, brandRepo: Repository<Brand>) {
    const brand = await brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    return brand;
  }

  private async resolveCategory(categoryId: number, categoryRepo: Repository<Category>) {
    const category = await categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('products.categoryNotFound');

    return category;
  }
}
