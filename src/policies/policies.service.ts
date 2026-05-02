import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConflictException } from 'src/common/exceptions';
import { isUniqueViolation } from 'src/common/helpers/db.helpers';

import { UpdatePolicyDTO } from './dtos/admin/update-policy.dto';
import { Policy } from './entities/policy.entity';
import { Policies, PolicyType } from './types';

@Injectable()
export class PoliciesService {
  constructor(@InjectRepository(Policy) private repo: Repository<Policy>) {}

  private static readonly POLICY_HISTORY_DEPTH = 2;

  async update(type: PolicyType, updateDTO: UpdatePolicyDTO): Promise<Policy> {
    try {
      return await this.repo.manager.transaction(async (manager) => {
        const policyRepo = manager.getRepository(Policy);

        const latest = await policyRepo.findOne({
          where: { type },
          order: { version: 'DESC' },
        });

        const newVersion = (latest?.version ?? 0) + 1;
        const policy = policyRepo.create({ type, ...updateDTO, version: newVersion });
        await policyRepo.save(policy);

        await manager.query(
          `DELETE FROM policy
         WHERE type = $1 AND version <= (
           SELECT MIN(version) FROM (
             SELECT version FROM policy
             WHERE type = $1
             ORDER BY version DESC
             LIMIT $2
           ) sub
         ) - 1`,
          [type, PoliciesService.POLICY_HISTORY_DEPTH],
        );

        return policy;
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw ConflictException('policies.concurrentUpdate');
      throw error;
    }
  }

  async getAll(): Promise<Policies> {
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
