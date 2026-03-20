import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaAttachmentService } from 'src/media';
import { Product, ProductOptionEntity, ProductVariantEntity } from 'src/entity';

import {
  CreateProductDTO,
  ProductDTO,
  ProductOptionDTO,
  UpdateProductDTO,
} from './dtos';

@Injectable()
export class ProductsService {
  constructor(
    private readonly mediaAttachmentService: MediaAttachmentService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDTO: CreateProductDTO) {
    const mediaIds = [...new Set(createProductDTO.mediaIds ?? [])];

    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);

      const product = productRepository.create({
        title: createProductDTO.title,
        description: createProductDTO.description,
        status: createProductDTO.status,
      });

      product.options = this.mapOptionsToEntities(
        product,
        createProductDTO.options,
      );

      const savedProduct = await productRepository.save(product);

      await this.mediaAttachmentService.sync(
        {
          mediaIds,
          entityId: savedProduct.id,
          entityType: 'product',
        },
        manager,
      );

      return this.findOneWithMediaOrFail(savedProduct.id, productRepository);
    });
  }

  async findAll(): Promise<ProductDTO[]> {
    const products = await this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: { options: { variants: true } },
    });

    const mediaMap = await this.mediaAttachmentService.getBulkMedia(
      products.map((product) => product.id),
      'product',
    );

    const productsWithMedia = products.map((product) => {
      const media = mediaMap[product.id] ?? [];

      return { ...product, media };
    });

    return productsWithMedia;
  }

  async findOne(id: number) {
    return this.findOneWithMediaOrFail(id);
  }

  async update(
    id: number,
    updateProductDTO: UpdateProductDTO,
  ): Promise<ProductDTO> {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);

      const product = await this.findOneOrFail(id, productRepository);

      const { mediaIds, ...updatableFields } = updateProductDTO;
      const { options, ...restUpdatableFields } = updatableFields;

      if (typeof mediaIds !== 'undefined')
        await this.mediaAttachmentService.sync(
          {
            mediaIds,
            entityId: id,
            entityType: 'product',
          },
          manager,
        );

      Object.assign(product, restUpdatableFields);

      if (typeof options !== 'undefined') {
        product.options = this.mapOptionsToEntities(product, options);
      }

      await productRepository.save(product);

      return this.findOneWithMediaOrFail(id, productRepository);
    });
  }

  async delete(id: number): Promise<void> {
    await this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);

      await this.mediaAttachmentService.sync(
        {
          mediaIds: [],
          entityId: id,
          entityType: 'product',
        },
        manager,
      );

      await productRepository.delete(id);
    });
  }

  private async findOneWithMediaOrFail(
    id: number,
    productRepository: Repository<Product> = this.productsRepository,
  ): Promise<ProductDTO> {
    const product = await this.findOneOrFail(id, productRepository);

    const media = await this.mediaAttachmentService.getMedia({
      entityId: product.id,
      entityType: 'product',
    });

    return { ...product, media };
  }

  private async findOneOrFail(
    id: number,
    productRepository: Repository<Product> = this.productsRepository,
  ): Promise<Product> {
    const product = await productRepository.findOne({
      where: { id },
      relations: { options: { variants: true } },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  private mapOptionsToEntities(
    product: Product,
    options?: ProductOptionDTO[],
  ): ProductOptionEntity[] | undefined {
    if (!options) return;

    return options.map((optionDTO) => {
      const option = new ProductOptionEntity();

      option.name = optionDTO.name;
      option.product = product;
      option.variants = optionDTO.variants.map((variantDTO) => {
        const variant = new ProductVariantEntity();

        variant.name = variantDTO.name;
        variant.stock = variantDTO.stock;
        variant.amount = variantDTO.amount;
        variant.costPerItem = variantDTO.costPerItem;
        variant.compareAt = variantDTO.compareAt ?? null;
        variant.option = option;

        return variant;
      });

      return option;
    });
  }
}
