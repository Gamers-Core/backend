import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaService } from 'src/media';
import {
  Media,
  Product,
  ProductOptionEntity,
  ProductVariantEntity,
} from 'src/entity';

import { CreateProductDTO, ProductOptionDTO, UpdateProductDTO } from './dtos';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly mediaService: MediaService,
  ) {}

  async create(createProductDTO: CreateProductDTO): Promise<Product> {
    const mediaIds = [...new Set(createProductDTO.mediaIds ?? [])];

    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const mediaRepository = manager.getRepository(Media);

      await this.mediaService.assertDraftMediaIdsAttachable(
        mediaIds,
        mediaRepository,
      );

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

      await this.mediaService.attachMediaToProduct(
        mediaIds,
        savedProduct.id,
        mediaRepository,
      );

      return this.findOneWithMediaOrFail(savedProduct.id, productRepository);
    });
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
      relations: { media: true, options: { variants: true } },
    });
  }

  async findOne(id: number): Promise<Product> {
    return this.findOneWithMediaOrFail(id);
  }

  async update(
    id: number,
    updateProductDTO: UpdateProductDTO,
  ): Promise<Product> {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const mediaRepository = manager.getRepository(Media);

      const product = await this.findOneWithMediaOrFail(id, productRepository);

      const { mediaIds, ...updatableFields } = updateProductDTO;
      const { options, ...restUpdatableFields } = updatableFields;

      if (typeof mediaIds !== 'undefined') {
        const { mediaIdsToAttach, mediaIdsToDetach } = this.buildMediaSyncPlan(
          mediaIds,
          product.media,
        );

        await this.mediaService.assertDraftMediaIdsAttachable(
          mediaIdsToAttach,
          mediaRepository,
        );

        await this.mediaService.detachMediaFromProduct(
          mediaIdsToDetach,
          id,
          mediaRepository,
        );

        await this.mediaService.attachMediaToProduct(
          mediaIdsToAttach,
          id,
          mediaRepository,
        );
      }

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
      const mediaRepository = manager.getRepository(Media);

      const product = await this.findOneWithMediaOrFail(id, productRepository);

      const attachedMediaIds = product.media.map(({ id }) => id);

      await this.mediaService.detachMediaFromProduct(
        attachedMediaIds,
        id,
        mediaRepository,
      );

      await productRepository.delete(id);
    });
  }

  private async findOneWithMediaOrFail(
    id: number,
    productRepository: Repository<Product> = this.productsRepository,
  ) {
    const product = await productRepository.findOne({
      where: { id },
      relations: { media: true, options: { variants: true } },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  private buildMediaSyncPlan(requestedMediaIds: number[], media: Media[]) {
    const uniqueRequestedMediaIds = [...new Set(requestedMediaIds)];
    const currentMediaIds = media.map(({ id }) => id);

    const currentMediaSet = new Set(currentMediaIds);
    const requestedMediaSet = new Set(uniqueRequestedMediaIds);

    const mediaIdsToDetach = currentMediaIds.filter(
      (mediaId) => !requestedMediaSet.has(mediaId),
    );
    const mediaIdsToAttach = uniqueRequestedMediaIds.filter(
      (mediaId) => !currentMediaSet.has(mediaId),
    );

    return {
      mediaIdsToAttach,
      mediaIdsToDetach,
    };
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
