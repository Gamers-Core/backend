import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, IsNull, Repository } from 'typeorm';

import { Brand } from 'src/brands/entities/brand.entity';
import { Category } from 'src/categories/entities/category.entity';
import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { paginate } from 'src/common/pagination/pagination';
import { withOptionalManager } from 'src/common/with-optional-manager';
import { LocaleContextService } from 'src/i18n/locale-context.service';
import { MediaService } from 'src/media/services/media.service';
import { ProductMediaService } from 'src/media/services/product-media.service';

import { AdminSearchProductsDTO } from '../dtos/admin/admin-search-products.dto';
import { CreateProductDTO } from '../dtos/admin/create-product.dto';
import { UpdateProductDTO } from '../dtos/admin/update-product.dto';
import { productRecommendationSelect } from '../dtos/user/product-recommendation.dto';
import { SearchProductsDTO } from '../dtos/user/search-products.dto';
import { simpleProductSelect } from '../dtos/user/simple-product.dto';
import { Product } from '../entities/product.entity';
import { Variant } from '../entities/variant.entity';

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

  async search(
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
    isAdmin: boolean = false,
  ) {
    const locale = this.localeContextService.locale;
    const trimmedQ = q?.trim();
    const effectiveSort = sort === 'most-relevant' && !trimmedQ ? 'created-descending' : sort;

    if (isAdmin) {
      const variantCondition = `v."deleted_at" IS NULL`;

      const qb = this.productsRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.brand', 'brand')
        .leftJoinAndSelect('brand.image', 'brandImage')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.media', 'productMedia')
        .leftJoinAndSelect('productMedia.media', 'productMediaFile')
        .leftJoinAndSelect('product.variants', 'variant', 'variant.deletedAt IS NULL')
        .leftJoinAndSelect('variant.image', 'variantImage');

      const status = 'status' in rest ? rest.status : undefined;
      if (status) qb.andWhere('product.status = :status', { status });

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

      return paginate(qb, rest);
    }

    const { page = 1, limit = 8 } = rest;

    const variantCondition = `
    v."product_id" = product.id
    AND v."deleted_at" IS NULL
    AND v."is_active" = true
  `;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.brand', 'brand')
      .leftJoin('product.category', 'category')
      .where('product.status = :status', { status: 'active' })
      .leftJoin(
        (sub) =>
          sub
            .subQuery()
            .select('v.product_id', 'product_id')
            .addSelect('MIN(v.price)', 'price_min')
            .addSelect('MAX(v.price)', 'price_max')
            .addSelect('bool_or(v.stock > 0)', 'has_stock')
            .addSelect('bool_or(v.compare_at IS NOT NULL AND v.compare_at > v.price)', 'has_sale')
            .from('product_variant_entity', 'v')
            .where('v.deleted_at IS NULL')
            .andWhere('v.is_active = true')
            .groupBy('v.product_id'),
        'variant_agg',
        'variant_agg.product_id = product.id',
      )
      .select([
        'product.id AS id',
        'product.name AS name',

        'brand.id AS brand_id',
        'brand.name AS brand_name',

        'category.id AS category_id',
        'category.name AS category_name',

        'variant_agg.price_min AS price_min',
        'variant_agg.price_max AS price_max',
        'COALESCE(variant_agg.has_stock, false) AS has_stock',
        'COALESCE(variant_agg.has_sale, false) AS has_sale',

        `(
        SELECT json_build_object(
          'src', m.src,
          'blurDataURL', m."blur_data_url",
          'type', m.type,
          'width', m.width,
          'height', m.height,
          'format', m.format,
          'bytes', m.bytes
        )
        FROM product_variant_entity v
        INNER JOIN media m
          ON m.id = v."image_id"
        WHERE
          v."product_id" = product.id
          AND v."deleted_at" IS NULL
          AND v."is_active" = true
          AND v."image_id" IS NOT NULL
          AND m."is_deleted" = false
        ORDER BY v.position ASC, v.id ASC
        LIMIT 1
      ) AS image`,
      ]);

    if (brandId) qb.andWhere('brand.id = :brandId', { brandId });
    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });

    if (trimmedQ)
      qb.andWhere(
        `(
        product.name::text ILIKE :q
        OR product.title::text ILIKE :q
        OR EXISTS (
          SELECT 1
          FROM product_variant_entity search_variant
          WHERE search_variant."product_id" = product.id
            AND search_variant."deleted_at" IS NULL
            AND search_variant."is_active" = true
            AND search_variant.name::text ILIKE :q
        )
      )`,
        { q: `%${trimmedQ}%` },
      );

    if (minPrice !== undefined)
      qb.andWhere(
        `EXISTS (SELECT 1 FROM product_variant_entity v WHERE ${variantCondition} AND v.price >= :minPrice)`,
        { minPrice },
      );

    if (maxPrice !== undefined)
      qb.andWhere(
        `EXISTS (SELECT 1 FROM product_variant_entity v WHERE ${variantCondition} AND v.price <= :maxPrice)`,
        { maxPrice },
      );

    if (stock === 'in-stock')
      qb.andWhere(`EXISTS (SELECT 1 FROM product_variant_entity v WHERE ${variantCondition} AND v.stock > 0)`);
    else if (stock === 'out-of-stock')
      qb.andWhere(`NOT EXISTS (SELECT 1 FROM product_variant_entity v WHERE ${variantCondition} AND v.stock > 0)`);

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
          .setParameter('locale', locale)
          .setParameter('exactQ', trimmedQ);
        break;

      case 'title-ascending':
        qb.orderBy('product.title->>:locale', 'ASC').setParameter('locale', locale);
        break;

      case 'title-descending':
        qb.orderBy('product.title->>:locale', 'DESC').setParameter('locale', locale);
        break;

      case 'price-ascending':
        qb.orderBy('variant_agg.price_min', 'ASC', 'NULLS LAST');
        break;

      case 'price-descending':
        qb.orderBy('variant_agg.price_max', 'DESC', 'NULLS LAST');
        break;

      case 'created-ascending':
        qb.orderBy('product.createdAt', 'ASC');
        break;

      case 'created-descending':
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    qb.addOrderBy('product.id', 'ASC');

    const totalItems = await qb.clone().getCount();

    qb.offset((page - 1) * limit).limit(limit);

    const rows = await qb.getRawMany<{
      id: string;
      name: Product['name'];
      brand_id: string;
      brand_name: string;
      category_id: string;
      category_name: string;
      price_min: string | null;
      price_max: string | null;
      has_stock: boolean;
      has_sale: boolean;
      image: {
        src: string;
        blurDataURL: string | null;
        type: string;
        width: number;
        height: number;
        format: string;
        bytes: number;
      } | null;
    }>();

    const data = rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      image: row.image,
      price: {
        min: Number(row.price_min ?? 0),
        max: Number(row.price_max ?? 0),
        sale: row.has_sale,
      },
      brand: { id: Number(row.brand_id), name: row.brand_name },
      category: { id: Number(row.category_id), name: row.category_name },
      hasStock: row.has_stock,
    }));

    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      },
    };
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

  async getRecommendations(productId: number) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: { brand: true, category: true },
      select: { id: true, brand: { id: true }, category: { id: true } },
    });
    if (!product) throw NotFoundException('products.productNotFound');

    const recommendationRows = await this.productsRepository
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
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(Variant, 'variant')
          .where('variant.product = product.id')
          .andWhere('variant.isActive = :active', { active: true })
          .andWhere('variant.stock > 0')
          .andWhere('variant.deletedAt IS NULL')
          .getQuery();
        return `EXISTS ${subQuery}`;
      })
      .orderBy(
        `CASE
          WHEN brand.id = :brandId AND category.id = :categoryId THEN 0
          WHEN brand.id = :brandId OR category.id = :categoryId THEN 1
          ELSE 2
        END`,
        'ASC',
      )
      .addOrderBy('product.updatedAt', 'DESC')
      .setParameters({ brandId: product.brand.id, categoryId: product.category.id })
      .limit(10)
      .getRawMany<{ id: string }>();

    const recommendationIds = this.pickRandom(
      recommendationRows.map(({ id }) => Number(id)),
      4,
    );

    if (!recommendationIds.length) return [];

    const recommendations = await this.productsRepository.find({
      where: { id: In(recommendationIds) },
      relations: { variants: { image: true }, brand: true, category: true },
      select: productRecommendationSelect,
      order: { variants: { position: 'ASC' } },
    });

    for (const product of recommendations) {
      const validVariants = product.variants.filter((variant) => variant.isActive && !variant.deletedAt);

      const inStock = validVariants.filter((variant) => variant.stock > 0);

      product.variants = inStock.length ? inStock : validVariants;
    }

    const recommendationsById = new Map(recommendations.map((product) => [product.id, product]));

    return recommendationIds
      .map((id) => recommendationsById.get(id))
      .filter((product): product is Product => !!product);
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
      const repository = manager.getRepository(Product);

      if (isAdmin)
        return this.buildProductQuery(manager, true)
          .where('product.id IN (:...ids)', { ids })
          .orderBy(preserveOrder ? `array_position(ARRAY[${ids.join(',')}], product.id)` : 'product.id', 'ASC')
          .addOrderBy('productMedia.order', 'ASC')
          .addOrderBy('variant.position', 'ASC')
          .addOrderBy('variant.id', 'ASC')
          .getMany();

      const products = await repository.find({
        where: {
          id: In(ids),
          ...(filterActive ? { status: 'active' } : {}),
          variants: { isActive: true, deletedAt: IsNull() },
        },
        select: simpleProductSelect,
        relations: { variants: { image: true } },
        order: { variants: { position: 'ASC', id: 'ASC' } },
      });

      if (!preserveOrder) return products.sort((a, b) => a.id - b.id);

      const order = new Map(ids.map((id, index) => [id, index]));

      return products.sort(
        (a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER),
      );
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
}
