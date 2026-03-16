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

      return productRepository.findOneOrFail({
        where: { id: savedProduct.id },
        relations: { media: true },
      });
    });
  }

  async findOne(id: number): Promise<Product> {
    return this.productsRepository.findOneOrFail({
      where: { id },
      relations: { media: true },
    });
  }
}
