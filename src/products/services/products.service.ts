import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { MediaService } from 'src/media/services/media.service';
import { ProductMediaService } from 'src/media/services/product-media.service';

import { AdminSearchProductsDTO } from '../dtos/admin/admin-search-products.dto';
import { CreateProductDTO } from '../dtos/admin/create-product.dto';
import { UpdateProductDTO } from '../dtos/admin/update-product.dto';
import { SearchProductsDTO } from '../dtos/user/search-products.dto';
import { Product } from '../entities/product.entity';
import { Variant } from '../entities/variant.entity';
import { productBrandCategoryRelations } from '../relations';

import { VariantsService } from './variants.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly productMediaService: ProductMediaService,
    private readonly variants: VariantsService,
    private readonly mediaService: MediaService,
    private readonly localeContextService: LocaleContextService,
  ) {}

  add({ brandId, categoryId, mediaIds, variants, ...dto }: CreateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      const [brandExists, categoryExists] = await Promise.all([
        manager.getRepository(Brand).existsBy({ id: brandId }),
        manager.getRepository(Category).existsBy({ id: categoryId }),
      ]);

      if (!brandExists) throw NotFoundException('products.brandNotFound');
      if (!categoryExists) throw NotFoundException('products.categoryNotFound');

      const product = await productRepo.save(
        productRepo.create({ ...dto, brand: { id: brandId }, category: { id: categoryId } }),
      );

      await this.variants.sync(product.id, variants, manager);

      if (mediaIds !== undefined) await this.productMediaService.sync(product.id, mediaIds, manager);

      return this.getOneOrFail(product.id, manager, true);
    });
  }

  getMany(ids: string) {
    const uniqueIds = [
      ...new Set(
        ids
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => Number.isInteger(n) && n > 0),
      ),
    ];
    if (!uniqueIds.length) throw BadRequestException('products.invalidIds');

    return this.getManyByIds(uniqueIds, false, { filterActive: true, preserveOrder: true });
  }

  getOne(id: number, isAdmin = false) {
    return this.getOneOrFail(id, undefined, isAdmin);
  }

  search(
    {
      q,
      brandId,
      categoryId,
      minPrice,
      maxPrice,
      stock = 'all',
      sort = 'created-descending',
      ...rest
    }: AdminSearchProductsDTO | SearchProductsDTO = {},
    isAdmin = false,
  ) {
    const locale = this.localeContextService.locale;
    const trimmedQ = q?.trim();
    const effectiveSort = sort === 'most-relevant' && !trimmedQ ? 'created-descending' : sort;
    const variantCondition = isAdmin ? `v."deleted_at" IS NULL` : `v."deleted_at" IS NULL AND v."is_active" = true`;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.image', 'brandImage')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.media', 'productMedia')
      .leftJoinAndSelect('productMedia.media', 'productMediaFile')
      .leftJoinAndSelect(
        'product.variants',
        'variant',
        isAdmin ? 'variant.deletedAt IS NULL' : 'variant.deletedAt IS NULL AND variant.isActive = true',
      )
      .leftJoinAndSelect('variant.image', 'variantImage');

    if (isAdmin) {
      const status = 'status' in rest ? rest.status : undefined;
      if (status) qb.andWhere('product.status = :status', { status });
    } else qb.andWhere('product.status = :status', { status: 'active' });

    if (brandId) qb.andWhere('brand.id = :brandId', { brandId });
    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });

    if (trimmedQ)
      qb.andWhere('(product.name::text ILIKE :q OR product.title::text ILIKE :q OR variant.name::text ILIKE :q)', {
        q: `%${trimmedQ}%`,
      });

    if (minPrice !== undefined)
      qb.andWhere(
        `EXISTS (
        SELECT 1 FROM product_variant_entity v
        WHERE v."product_id" = product.id
          AND ${variantCondition}
          AND v.price >= :minPrice
      )`,
        { minPrice },
      );

    if (maxPrice !== undefined)
      qb.andWhere(
        `EXISTS (
        SELECT 1 FROM product_variant_entity v
        WHERE v."product_id" = product.id
          AND ${variantCondition}
          AND v.price <= :maxPrice
      )`,
        { maxPrice },
      );

    if (stock === 'in-stock')
      qb.andWhere(
        `EXISTS (
        SELECT 1 FROM product_variant_entity v
        WHERE v."product_id" = product.id
          AND ${variantCondition}
          AND v.stock > 0
      )`,
      );
    else if (stock === 'out-of-stock')
      qb.andWhere(
        `NOT EXISTS (
        SELECT 1 FROM product_variant_entity v
        WHERE v."product_id" = product.id
          AND ${variantCondition}
          AND v.stock > 0
      )`,
      );

    switch (effectiveSort) {
      case 'most-relevant':
        qb.orderBy(
          `CASE
          WHEN product.name->>:locale ILIKE :exactQ THEN 0
          WHEN product.title->>:locale ILIKE :exactQ THEN 1
          ELSE 2
        END`,
          'ASC',
        )
          .addOrderBy('product.updatedAt', 'DESC')
          .setParameter('exactQ', trimmedQ)
          .setParameter('locale', locale);
        break;

      case 'title-ascending':
        qb.orderBy('product.title->>:locale', 'ASC').setParameter('locale', locale);
        break;

      case 'title-descending':
        qb.orderBy('product.title->>:locale', 'DESC').setParameter('locale', locale);
        break;

      case 'price-ascending':
        qb.orderBy(
          `(SELECT MIN(v.price) FROM product_variant_entity v
          WHERE v."product_id" = product.id AND ${variantCondition})`,
          'ASC',
          'NULLS LAST',
        );
        break;

      case 'price-descending':
        qb.orderBy(
          `(SELECT MAX(v.price) FROM product_variant_entity v
          WHERE v."product_id" = product.id AND ${variantCondition})`,
          'DESC',
          'NULLS LAST',
        );
        break;

      case 'created-ascending':
        qb.orderBy('product.createdAt', 'ASC');
        break;

      case 'created-descending':
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    qb.addOrderBy('product.id', 'ASC').addOrderBy('variant.position', 'ASC').addOrderBy('variant.id', 'ASC');

    return qb.getMany();
  }

  update(id: number, { mediaIds, brandId, categoryId, variants, ...dto }: UpdateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      const product = await this.getOneOrFail(id, manager, true);

      Object.assign(product, dto);

      if (brandId) {
        const brandExists = await manager.getRepository(Brand).existsBy({ id: brandId });
        if (!brandExists) throw NotFoundException('products.brandNotFound');

        product.brand = { id: brandId } as Brand;
      }

      if (categoryId) {
        const categoryExists = await manager.getRepository(Category).existsBy({ id: categoryId });
        if (!categoryExists) throw NotFoundException('products.categoryNotFound');

        product.category = { id: categoryId } as Category;
      }

      await productRepo.save(product);

      if (mediaIds !== undefined) await this.productMediaService.sync(id, mediaIds, manager);

      if (variants) await this.variants.sync(id, variants, manager);

      return this.getOneOrFail(id, manager, true);
    });
  }

  remove(id: number): Promise<void> {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);

      const product = await this.getOneOrFail(id, manager, true);

      await Promise.all(
        product.variants.filter(({ image }) => image).map(({ image }) => this.mediaService.detach(image!.id, manager)),
      );

      await this.productMediaService.sync(id, [], manager);

      await productRepo.delete(id);
    });
  }

  getRecommendations(productId: number) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const repo = manager.getRepository(Product);

      const product = await this.getOneForRecommendationsOrFail(productId, manager);

      const recommendationRows = await repo
        .createQueryBuilder('product')
        .select('product.id', 'id')
        .leftJoin('product.brand', 'brand')
        .leftJoin('product.category', 'category')
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
            .where('v.product = product.id')
            .andWhere('v.isActive = :active', { active: true })
            .andWhere('v.stock > 0')
            .andWhere('v.deletedAt IS NULL')
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
        .addOrderBy('product.updatedAt', 'DESC')
        .limit(10)
        .getRawMany<{ id: string }>();

      const recommendationIds = this.pickRandom(
        recommendationRows.map(({ id }) => Number(id)),
        4,
      );

      if (!recommendationIds.length) return [];

      const recommendations = await this.getManyByIds(recommendationIds, false, { preserveOrder: true }, manager);

      const recommendationsById = new Map(recommendations.map((item) => [item.id, item]));
      const orderedRecommendations = recommendationIds
        .map((id) => recommendationsById.get(id))
        .filter((item): item is Product => !!item);

      return orderedRecommendations;
    });
  }

  private pickRandom<T>(items: T[], count: number): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  private getOneOrFail(id: number, manager?: EntityManager, isAdmin = false): Promise<Product> {
    return withOptionalManager(manager, this.productsRepository.manager, async (manager) => {
      const qb = this.buildProductQuery(manager, isAdmin)
        .where('product.id = :id', { id })
        .orderBy('productMedia.order', 'ASC')
        .addOrderBy('variant.position', 'ASC')
        .addOrderBy('variant.id', 'ASC');

      if (!isAdmin) qb.andWhere('product.status = :status', { status: 'active' });

      const product = await qb.getOne();

      if (!product) throw NotFoundException('products.productNotFound');

      return product;
    });
  }

  private getManyByIds(
    ids: number[],
    isAdmin: boolean,
    { filterActive = false, preserveOrder = false }: { filterActive?: boolean; preserveOrder?: boolean } = {},
    manager?: EntityManager,
  ): Promise<Product[]> {
    if (!ids.length) return Promise.resolve([]);

    return withOptionalManager(manager, this.productsRepository.manager, async (manager) => {
      const qb = this.buildProductQuery(manager, isAdmin).where('product.id IN (:...ids)', { ids });

      if (filterActive && !isAdmin) qb.andWhere('product.status = :status', { status: 'active' });

      qb.orderBy(preserveOrder ? `array_position(ARRAY[${ids.join(',')}], product.id)` : 'product.id', 'ASC')
        .addOrderBy('productMedia.order', 'ASC')
        .addOrderBy('variant.position', 'ASC')
        .addOrderBy('variant.id', 'ASC');

      return qb.getMany();
    });
  }

  private buildProductQuery(manager: EntityManager, isAdmin: boolean) {
    const variantJoinCondition = isAdmin
      ? 'variant.deletedAt IS NULL'
      : 'variant.deletedAt IS NULL AND variant.isActive = true';

    return manager
      .getRepository(Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('brand.image', 'brandImage')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.media', 'productMedia')
      .leftJoinAndSelect('productMedia.media', 'productMediaFile')
      .leftJoinAndSelect('product.variants', 'variant', variantJoinCondition)
      .leftJoinAndSelect('variant.image', 'variantImage');
  }

  private getOneForRecommendationsOrFail(id: number, manager?: EntityManager): Promise<Product> {
    return withOptionalManager(manager, this.productsRepository.manager, async (manager) => {
      const repo = manager.getRepository(Product);

      const product = await repo.findOne({
        where: { id },
        relations: productBrandCategoryRelations,
        order: {
          media: { order: 'ASC' },
          variants: { position: 'ASC' },
        },
      });

      if (!product) throw NotFoundException('products.productNotFound');

      return product;
    });
  }
}
