import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Brand, Product } from 'src/entity';
import { MediaAttachmentService } from 'src/media';
import { NotFoundException } from 'src/common';

import { CreateProductDTO, UpdateProductDTO } from '../dtos/admin';
import { VariantsService } from './variants.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly mediaAttachmentService: MediaAttachmentService,
    private readonly variants: VariantsService,
  ) {}

  async create({ brandId, mediaIds, variants, ...dto }: CreateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const brandRepo = manager.getRepository(Brand);

      const brand = await this.resolveBrand(brandId, brandRepo);
      const product = await productRepo.save(productRepo.create({ ...dto, brand }));

      await this.variants.add(product.id, variants, manager);

      if (mediaIds !== undefined)
        await this.mediaAttachmentService.sync({ entityId: product.id, entityType: 'product', mediaIds }, manager);

      return this.findOneWithMediaOrFail(product.id, productRepo);
    });
  }

  async findAll() {
    const products = await this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: { variants: true, brand: true },
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

  async update(id: number, { mediaIds, brandId, ...dto }: UpdateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const brandRepo = manager.getRepository(Brand);

      const product = await this.findOneOrFail(id, productRepo);

      if (mediaIds !== undefined)
        await this.mediaAttachmentService.sync({ entityId: id, entityType: 'product', mediaIds }, manager);

      Object.assign(product, dto);

      const brand = await this.resolveBrand(brandId, brandRepo);
      product.brand = brand;

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
      relations: { variants: true, brand: true },
    });

    if (!product) throw new NotFoundException('products.productNotFound');

    return product;
  }

  private async resolveBrand(brandId: number | undefined, brandRepo: Repository<Brand>) {
    if (!brandId) return null;

    const brand = await brandRepo.findOne({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('products.brandNotFound');

    return brand;
  }
}
