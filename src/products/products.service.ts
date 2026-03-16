import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaService } from 'src/media';
import { Media, Product } from 'src/entity';

import { CreateProductDTO } from './dtos';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly mediaService: MediaService,
  ) {}

  async create(createProductDTO: CreateProductDTO): Promise<Product> {
    const mediaIds = this.getMediaIds(createProductDTO);

    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const mediaRepository = manager.getRepository(Media);

      await this.mediaService.assertDraftMediaIdsAttachable(
        mediaIds,
        mediaRepository,
      );

      const product = productRepository.create(createProductDTO);

      const savedProduct = await productRepository.save(product);

      await this.mediaService.attachMediaToProduct(
        mediaIds,
        savedProduct.id,
        mediaRepository,
      );

      return productRepository.findOneOrFail({
        where: { id: savedProduct.id },
        relations: { media: true },
      });
    });
  }

  private getMediaIds(createProductDTO: CreateProductDTO): number[] {
    const productMediaIds = createProductDTO.mediaIds ?? [];
    const variantImageIds =
      createProductDTO.options?.flatMap((option) =>
        option.variants.reduce<number[]>((ids, { imageId }) => {
          if (imageId) ids.push(imageId);

          return ids;
        }, []),
      ) ?? [];

    return [...new Set([...productMediaIds, ...variantImageIds])];
  }
}
