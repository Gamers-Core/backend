import { Test, TestingModule } from '@nestjs/testing';
import { ProductsUserController } from './products-user.controller';
import { ProductsService } from './products.service';

describe('ProductsUserController', () => {
  let controller: ProductsUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsUserController],
      providers: [{ provide: ProductsService, useValue: {} }],
    }).compile();

    controller = module.get<ProductsUserController>(ProductsUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
