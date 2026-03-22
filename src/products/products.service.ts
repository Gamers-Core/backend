import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MediaAttachmentService } from 'src/media';
import { Brand, Product } from 'src/entity';

import { CreateProductDTO, ProductDTO, UpdateProductDTO } from './dtos';
import { VariantsService } from './variants.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly mediaAttachmentService: MediaAttachmentService,
    private readonly variantsService: VariantsService,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDTO: CreateProductDTO) {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const brandRepository = manager.getRepository(Brand);

      let brand: Brand | null = null;
      if (typeof createProductDTO.brandId !== 'undefined') {
        brand = await brandRepository.findOne({
          where: { id: createProductDTO.brandId },
        });

        if (!brand) throw new NotFoundException('Brand not found');
      }

      const product = productRepository.create({
        title: createProductDTO.title,
        description: createProductDTO.description,
        status: createProductDTO.status,
        brand: brand ?? undefined,
        variants: [],
      });
      const savedProduct = await productRepository.save(product);

      await this.variantsService.sync(savedProduct, createProductDTO.variants, manager);

      await this.mediaAttachmentService.sync(
        {
          mediaIds: createProductDTO.mediaIds ?? [],
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
      relations: { variants: true, brand: true },
    });

    const variantIds = products.flatMap((product) => product.variants.map((variant) => variant.id));

    const mediaMap = await this.mediaAttachmentService.getBulkMedia(
      products.map((product) => product.id),
      'product',
    );

    const variantMediaMap = await this.mediaAttachmentService.getBulkMedia(variantIds, 'variant');

    const productsWithMedia = products.map((product) => {
      return this.serializeProduct(product, mediaMap[product.id] ?? [], variantMediaMap);
    });

    return productsWithMedia;
  }

  async findOne(id: number) {
    return this.findOneWithMediaOrFail(id);
  }

  async update(id: number, updateProductDTO: UpdateProductDTO): Promise<ProductDTO> {
    return this.productsRepository.manager.transaction(async (manager) => {
      const productRepository = manager.getRepository(Product);
      const brandRepository = manager.getRepository(Brand);

      const product = await this.findOneOrFail(id, productRepository);

      const { variants, mediaIds, brandId, ...updatableFields } = updateProductDTO;

      if (typeof mediaIds !== 'undefined')
        await this.mediaAttachmentService.sync(
          {
            mediaIds,
            entityId: id,
            entityType: 'product',
          },
          manager,
        );

      Object.assign(product, updatableFields);

      if (typeof brandId !== 'undefined') {
        const brand = await brandRepository.findOne({ where: { id: brandId } });
        if (!brand) throw new NotFoundException('Brand not found');
        product.brand = brand;
      }

      const updatedProduct = await productRepository.save(product);

      if (typeof variants !== 'undefined') {
        await this.variantsService.sync(updatedProduct, variants, manager);
      }

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

    const variantMediaMap = await this.mediaAttachmentService.getBulkMedia(
      product.variants.map((variant) => variant.id),
      'variant',
    );
    return this.serializeProduct(product, media, variantMediaMap);
  }

  private serializeProduct(
    product: Product,
    media: ProductDTO['media'],
    variantMediaMap: Record<number, ProductDTO['variants'][number]['media']>,
  ): ProductDTO {
    const variants = product.variants.map((variant) => ({
      ...variant,
      media: variantMediaMap[variant.id] ?? [],
    }));
    const brand = product.brand
      ? {
          id: product.brand?.id,
          name: product.brand?.name,
        }
      : null;

    return {
      ...product,
      variants,
      media,
      brand,
    };
  }

  private async findOneOrFail(
    id: number,
    productRepository: Repository<Product> = this.productsRepository,
  ): Promise<Product> {
    const product = await productRepository.findOne({
      where: { id },
      relations: { variants: true, brand: true },
    });

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }
}
