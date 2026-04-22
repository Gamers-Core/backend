import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Policies, Policy, PolicyType } from 'src/entity';

import { UpdatePolicyDTO } from './dtos';

@Injectable()
export class PoliciesService {
  constructor(@InjectRepository(Policy) private repo: Repository<Policy>) {}

  private static readonly POLICY_HISTORY_DEPTH = 2;

  async updatePolicy(type: PolicyType, updateDTO: UpdatePolicyDTO): Promise<Policy> {
    const latest = await this.repo.findOne({
      where: { type },
      order: { version: 'DESC' },
    });

    const newVersion = (latest?.version ?? 0) + 1;
    const policy = this.repo.create({ type, ...updateDTO, version: newVersion });
    await this.repo.save(policy);

    await this.repo
      .createQueryBuilder()
      .delete()
      .where(
        `type = :type AND version <= (
        SELECT MIN(version) FROM (
          SELECT version FROM policy
          WHERE type = :type
          ORDER BY version DESC
          LIMIT :depth
        ) sub
      ) - 1`,
        { type, depth: PoliciesService.POLICY_HISTORY_DEPTH },
      )
      .execute();

    return policy;
  }

  async getLatestAll(): Promise<Policies> {
    const rows = await this.repo
      .createQueryBuilder('p')
      .distinctOn(['p.type'])
      .orderBy('p.type')
      .addOrderBy('p.version', 'DESC')
      .getMany();

    return rows.reduce((acc, policy) => {
      acc[policy.type] = policy;
      return acc;
    }, {} as Policies);
  }

  async getHistory(type: PolicyType): Promise<Policy[]> {
    return this.repo.find({
      where: { type },
      order: { version: 'DESC' },
    });
  }
}
