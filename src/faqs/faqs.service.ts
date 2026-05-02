import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';
import { withOptionalManager } from 'src/common/with-optional-manager';

import { AddFAQDTO } from './dtos/admin/add-faq.dto';
import { UpdateFAQDTO } from './dtos/admin/update-faq.dto';
import { FAQ } from './entities/faq.entity';

@Injectable()
export class FAQsService {
  constructor(
    @InjectRepository(FAQ)
    private readonly repo: Repository<FAQ>,
  ) {}

  getAll() {
    return this.getAllOrdered();
  }

  add(dto: AddFAQDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const maxRaw = await repo
        .createQueryBuilder('faq')
        .select('MAX(faq.position)', 'max')
        .getRawOne<{ max: string | null }>();
      const maxPosition = Number(maxRaw?.max) || 0;

      await repo.save(repo.create({ ...dto, position: maxPosition + 1 }));

      return this.getAllOrdered(manager);
    });
  }

  update(id: number, dto: UpdateFAQDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const result = await repo.update(id, dto);
      if (!result.affected) throw NotFoundException('faqs.notFound');

      return this.getAllOrdered(manager);
    });
  }

  remove(id: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const result = await repo.delete(id);
      if (!result.affected) throw NotFoundException('faqs.notFound');

      const remaining = await this.getAllOrdered(manager);
      await this.reorderWithPositions(remaining, manager);

      return this.getAllOrdered(manager);
    });
  }

  reorder(ids: number[]): Promise<FAQ[]> {
    return this.repo.manager.transaction(async (manager) => {
      const faqs = await this.getAllOrdered(manager);

      const uniqueIds = new Set(ids);
      if (faqs.length !== uniqueIds.size) throw BadRequestException('faqs.invalidIds');

      const faqById = new Map(faqs.map((faq) => [faq.id, faq]));
      if (ids.some((id) => !faqById.has(id))) throw BadRequestException('faqs.invalidIds');

      const ordered = ids.map((id) => faqById.get(id)!);
      await this.reorderWithPositions(ordered, manager);

      return this.getAllOrdered(manager);
    });
  }

  private async reorderWithPositions(faqs: FAQ[], manager: EntityManager): Promise<void> {
    if (!faqs.length) return;

    const repo = manager.getRepository(FAQ);

    await repo.save(faqs.map((faq, i) => ({ ...faq, position: -(i + 1) })));
    await repo.save(faqs.map((faq, i) => ({ ...faq, position: i + 1 })));
  }

  private getAllOrdered(manager?: EntityManager): Promise<FAQ[]> {
    return withOptionalManager(manager, this.repo.manager, async (manager) => {
      const repo = manager.getRepository(FAQ);

      return repo.find({ order: { position: 'ASC' } });
    });
  }
}
