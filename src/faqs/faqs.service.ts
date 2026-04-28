import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { BadRequestException, NotFoundException } from 'src/common/exceptions';

import { AddFAQDTO } from './dtos/add-faq.dto';
import { UpdateFAQDTO } from './dtos/update-faq.dto';
import { FAQ } from './entities/faq.entity';

@Injectable()
export class FAQsService {
  constructor(
    @InjectRepository(FAQ)
    private readonly repo: Repository<FAQ>,
  ) {}

  async getAll() {
    return this.repo.find({ order: { position: 'ASC' } });
  }

  async add(dto: AddFAQDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const maxRaw = await repo
        .createQueryBuilder('faq')
        .select('MAX(faq.position)', 'max')
        .getRawOne<{ max: string | null }>();

      const maxPosition = Number(maxRaw?.max) || 0;

      await repo.save(repo.create({ ...dto, position: maxPosition + 1 }));

      return this.findAllSorted(manager);
    });
  }

  async update(id: number, dto: UpdateFAQDTO) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const faq = await repo.findOne({ where: { id } });
      if (!faq) throw new NotFoundException('faqs.notFound');

      Object.assign(faq, dto);
      await repo.save(faq);

      return this.findAllSorted(manager);
    });
  }

  async remove(id: number) {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);

      const faq = await repo.findOne({ where: { id } });
      if (!faq) throw new NotFoundException('faqs.notFound');

      await repo.remove(faq);

      const remaining = await repo.find({ order: { position: 'ASC' } });
      await this.reorderWithPositions(remaining, manager);

      return this.findAllSorted(manager);
    });
  }

  reorder(ids: number[]): Promise<FAQ[]> {
    return this.repo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(FAQ);
      const faqs = await repo.find({ order: { position: 'ASC' } });

      this.validateReorderIds(ids, faqs);

      const faqById = new Map(faqs.map((faq) => [faq.id, faq]));
      const ordered = ids.map((id) => faqById.get(id)!);

      await this.reorderWithPositions(ordered, manager);

      return this.findAllSorted(manager);
    });
  }

  private async reorderWithPositions(faqs: FAQ[], manager: EntityManager): Promise<void> {
    if (!faqs.length) return;

    const repo = manager.getRepository(FAQ);

    await repo.save(faqs.map((faq, i) => ({ ...faq, position: -(i + 1) })));
    await repo.save(faqs.map((faq, i) => ({ ...faq, position: i + 1 })));
  }

  private findAllSorted(manager: EntityManager): Promise<FAQ[]> {
    return manager.getRepository(FAQ).find({ order: { position: 'ASC' } });
  }

  private validateReorderIds(ids: number[], faqs: FAQ[]): void {
    const uniqueIds = new Set(ids);

    if (ids.length !== faqs.length || uniqueIds.size !== ids.length) {
      throw new BadRequestException('faqs.invalidIds');
    }

    const existingIds = new Set(faqs.map((f) => f.id));
    if (ids.some((id) => !existingIds.has(id))) {
      throw new BadRequestException('faqs.invalidIds');
    }
  }
}
