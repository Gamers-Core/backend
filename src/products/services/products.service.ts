import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';

import { Brand, Category, Product, Variant } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { BadRequestException, NotFoundException } from 'src/common';
import { LocaleContextService } from 'src/i18n';

import { AdminSearchProductsDTO, CreateProductDTO, SearchProductsDTO, UpdateProductDTO } from '../dtos';
import { productBrandCategoryRelations, productFullRelations } from '../relations';
import { VariantsService } from './variants.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly mediaAttachmentService: MediaAttachmentService,
    private readonly variants: VariantsService,
    private readonly localeContextService: LocaleContextService,
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

  async findMany(ids: string) {
    if (!ids?.trim()) throw new BadRequestException('products.invalidIds');

    const idSegments = ids.split(',').map((id) => id.trim());

    if (!idSegments.length || idSegments.some((id) => !id || !/^\d+$/.test(id)))
      throw new BadRequestException('products.invalidIds');

    const idArray = idSegments.map((id) => Number(id));

    if (idArray.some((id) => !Number.isInteger(id) || id <= 0)) throw new BadRequestException('products.invalidIds');

    const uniqueIds = Array.from(new Set(idArray));
    if (!uniqueIds.length) throw new BadRequestException('products.invalidIds');

    const products = await this.productsRepository.find({
      where: { id: In(uniqueIds) },
      relations: productFullRelations,
    });

    return this.attachMediaToProducts(products);
  }

  async findOne(id: number) {
    return this.findOneWithMediaOrFail(id);
  }

  async search(
    {
      q,
      brandId,
      categoryId,
      minPrice,
      maxPrice,
      stock = 'all',
      ...rest
    }: AdminSearchProductsDTO | SearchProductsDTO = {},
    isAdmin = false,
  ) {
    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect(
        'product.variants',
        'variant',
        isAdmin ? 'variant.deletedAt IS NULL' : 'variant.deletedAt IS NULL AND variant.isActive = true',
      );

    if (isAdmin) {
      const status = 'status' in rest ? rest.status : undefined;
      if (status) qb.andWhere('product.status = :status', { status });
    } else qb.andWhere('product.status = :status', { status: 'active' });

    if (brandId) qb.andWhere('brand.id = :brandId', { brandId });

    if (categoryId) qb.andWhere('category.id = :categoryId', { categoryId });

    if (q?.trim())
      qb.andWhere(`(product.name::text ILIKE :q OR product.title::text ILIKE :q OR variant.name::text ILIKE :q)`, {
        q: `%${q.trim()}%`,
      });

    const variantCondition = isAdmin ? `v."deleted_at" IS NULL` : `v."deleted_at" IS NULL AND v."is_active" = true`;

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
    if (stock === 'out-of-stock')
      qb.andWhere(
        `NOT EXISTS (
        SELECT 1 FROM product_variant_entity v
        WHERE v."product_id" = product.id
          AND ${variantCondition}
          AND v.stock > 0
      )`,
      );

    const { sort = 'created-descending' } = 'sort' in rest ? rest : {};

    const effectiveSort = sort === 'most-relevant' && !q?.trim() ? 'created-descending' : sort;

    switch (effectiveSort) {
      case 'most-relevant':
        qb.orderBy(
          `CASE
                    WHEN product.name->>'${this.localeContextService.locale}' ILIKE :exactQ THEN 0
                    WHEN product.title->>'${this.localeContextService.locale}' ILIKE :exactQ THEN 1
                    ELSE 2
                END`,
          'ASC',
        ).addOrderBy('product.updatedAt', 'DESC');
        qb.setParameter('exactQ', q!.trim());
        break;

      case 'title-ascending':
        qb.orderBy(`product.title->>'${this.localeContextService.locale}'`, 'ASC');
        break;

      case 'title-descending':
        qb.orderBy(`product.title->>'${this.localeContextService.locale}'`, 'DESC');
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

    qb.addOrderBy('product.id', 'ASC').addOrderBy('variant.id', 'ASC');

    const products = await qb.getMany();

    return this.attachMediaToProducts(products);
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

  async getRecommendations(productId: number) {
    const product = await this.findOneForRecommendationsOrFail(productId);

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

    const recommendations = await this.productsRepository.find({
      where: { id: In(recommendationIds) },
      relations: productFullRelations,
    });

    const recommendationsById = new Map(recommendations.map((item) => [item.id, item]));
    const orderedRecommendations = recommendationIds
      .map((id) => recommendationsById.get(id))
      .filter((item): item is Product => !!item);

    return this.attachMediaToProducts(orderedRecommendations);
  }

  private pickRandom<T>(items: T[], count: number): T[] {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  private async findOneWithMediaOrFail(id: number, productRepository: Repository<Product> = this.productsRepository) {
    const product = await this.findOneOrFail(id, productRepository);

    const [productWithMedia] = await this.attachMediaToProducts([product]);

    return productWithMedia;
  }

  private async attachMediaToProducts(products: Product[]) {
    if (!products.length) return [];

    const variantIds = products.flatMap((product) => product.variants.map((variant) => variant.id));
    const brandIds = Array.from(new Set(products.map((product) => product.brand.id)));

    const [mediaMap, variantMediaMap, brandMediaMap] = await Promise.all([
      this.mediaAttachmentService.getBulkMedia(
        products.map(({ id }) => id),
        'product',
      ),
      this.mediaAttachmentService.getBulkMedia(variantIds, 'variant'),
      this.mediaAttachmentService.getBulkMedia(brandIds, 'brand'),
    ]);

    return products.map((product) => {
      const variants = product.variants.map((variant) => ({ ...variant, media: variantMediaMap[variant.id] ?? [] }));
      const brand = { ...product.brand, image: brandMediaMap[product.brand.id]?.[0] ?? null };

      return { ...product, variants, media: mediaMap[product.id] ?? [], brand };
    });
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

  private async findOneForRecommendationsOrFail(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: productBrandCategoryRelations,
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
