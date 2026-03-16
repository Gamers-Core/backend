import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaService } from 'src/media';
import { Media, Product } from 'src/entity';

import { CreateProductDTO, UpdateProductDTO } from './dtos';

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
        options: createProductDTO.options ?? null,
      });

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
      relations: { media: true },
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

      Object.assign(product, updatableFields);

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
      relations: { media: true },
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
}
