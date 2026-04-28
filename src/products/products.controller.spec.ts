import { Test, TestingModule } from '@nestjs/testing';

import { UserProductsController } from './controllers/user-products.controller';
import { ProductsService } from './services/products.service';

describe('UserProductsController', () => {
  let controller: UserProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProductsController],
      providers: [{ provide: ProductsService, useValue: {} }],
    }).compile();

    controller = module.get<UserProductsController>(UserProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
