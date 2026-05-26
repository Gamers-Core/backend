import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ConflictException } from 'src/common/exceptions';
import { isUniqueViolation } from 'src/common/helpers/db.helpers';
import { withEnvironment } from 'src/common/with-environment';
import { MailService } from 'src/mail/mail.service';
import { CacheService } from 'src/redis/cache.service';
import { UsersService } from 'src/users/users.service';

import { UpdatePolicyDTO } from './dtos/admin/update-policy.dto';
import { Policy } from './entities/policy.entity';
import { Policies, PolicyType } from './types';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);

  constructor(
    @InjectRepository(Policy) private repo: Repository<Policy>,
    private readonly cacheService: CacheService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  private static readonly POLICY_HISTORY_DEPTH = 2;
  private static readonly POLICY_UPDATE_EMAIL_BATCH_SIZE = 50;
  private static readonly POLICY_UPDATE_EMAIL_BATCH_DELAY_MS = 250;
  private readonly CACHE_KEY = 'policies:all';

  async update(type: PolicyType, updateDTO: UpdatePolicyDTO): Promise<Policy> {
    try {
      const policy = await this.repo.manager.transaction(async (manager) => {
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

        await this.cacheService.delete(this.CACHE_KEY);

        return policy;
      });

      await this.sendPolicyUpdateEmail(policy);

      return policy;
    } catch (error) {
      if (isUniqueViolation(error)) throw ConflictException('policies.concurrentUpdate');
      throw error;
    }
  }

  async getAll(): Promise<Policies> {
    return this.cacheService.getOrSet(
      this.CACHE_KEY,
      async () => {
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
      },
      { ttlMs: 1000 * 60 * 60 * 24 },
    );
  }

  async getHistory(type: PolicyType): Promise<Policy[]> {
    return this.repo.find({
      where: { type },
      order: { version: 'DESC' },
    });
  }

  private async sendPolicyUpdateEmail(policy: Policy) {
    await withEnvironment(
      async (isValid) => {
        if (!isValid) return;

        const recipients = await this.usersService.getMailRecipients();
        if (!recipients.length) return;

        for (let i = 0; i < recipients.length; i += PoliciesService.POLICY_UPDATE_EMAIL_BATCH_SIZE) {
          const batch = recipients.slice(i, i + PoliciesService.POLICY_UPDATE_EMAIL_BATCH_SIZE);

          const results = await Promise.allSettled(
            batch.map((recipient) =>
              this.mailService.sendTypedMail(
                recipient.email,
                'policy_update',
                { policyType: policy.type, version: policy.version, updatedAt: policy.createdAt },
                recipient.locale,
              ),
            ),
          );

          const failures = results.filter((result) => result.status === 'rejected');
          if (failures.length) this.logger.warn(`Policy update email failures: ${failures.length}`);

          if (i + PoliciesService.POLICY_UPDATE_EMAIL_BATCH_SIZE < recipients.length)
            await this.delay(PoliciesService.POLICY_UPDATE_EMAIL_BATCH_DELAY_MS);
        }
      },
      ['staging', 'production', 'local'],
    );
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
