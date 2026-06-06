import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { NotFoundException } from 'src/common/exceptions';
import { isUniqueViolation } from 'src/common/helpers/db.helpers';
import { Locale } from 'src/i18n/types';

import { AdminSearchUsersDTO } from './dtos/admin/admin-search-users.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async getOrCreate(email: string) {
    const user = await this.getOneByEmail(email);
    if (user) return { user, isNewUser: false };

    try {
      const newUser = await this.create(email);
      return { user: newUser, isNewUser: true };
    } catch (error) {
      if (isUniqueViolation(error)) {
        const user = await this.getOneByEmailOrFail(email);
        return { user, isNewUser: false };
      }
      throw error;
    }
  }

  create(email: string) {
    return this.repo.save(this.repo.create({ email }));
  }

  getOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  getFull(id: number) {
    return this.repo.findOne({ where: { id }, relations: { addresses: true } });
  }

  getAdminByEmail(email: string) {
    return this.repo.findOne({ where: { email, isAdmin: true } });
  }

  getMailRecipients(includeAdmins = false) {
    return this.repo.find({ select: { email: true, locale: true }, where: { isAdmin: includeAdmins } });
  }

  getAllForAdmin({ q, sort }: AdminSearchUsersDTO = {}) {
    const trimmedQ = q?.trim();

    const qb = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.addresses', 'address')
      .where('user.isAdmin = false')
      .andWhere('user.name IS NOT NULL')
      .loadRelationCountAndMap('user.ordersCount', 'user.orders');

    if (trimmedQ)
      qb.andWhere('(user.name ILIKE :q OR user.email ILIKE :q OR address.phoneNumber ILIKE :q)', {
        q: `%${trimmedQ}%`,
      });

    switch (sort) {
      case 'name-ascending':
        qb.orderBy('user.name', 'ASC');
        break;

      case 'name-descending':
        qb.orderBy('user.name', 'DESC');
        break;

      case 'email-ascending':
        qb.orderBy('user.email', 'ASC');
        break;

      case 'email-descending':
        qb.orderBy('user.email', 'DESC');
        break;

      case 'orders-ascending':
        qb.orderBy(`(SELECT COUNT(*) FROM "order" WHERE "order"."user_id" = "user"."id")`, 'ASC');
        break;
      case 'orders-descending':
        qb.orderBy(`(SELECT COUNT(*) FROM "order" WHERE "order"."user_id" = "user"."id")`, 'DESC');
        break;

      case 'addresses-ascending':
        qb.orderBy('(SELECT COUNT(*) FROM "address" WHERE "address"."user_id" = "user"."id")', 'ASC');
        break;

      case 'addresses-descending':
        qb.orderBy('(SELECT COUNT(*) FROM "address" WHERE "address"."user_id" = "user"."id")', 'DESC');
        break;

      case 'locale-ascending':
        qb.orderBy('user.locale', 'ASC');
        break;

      case 'locale-descending':
        qb.orderBy('user.locale', 'DESC');
        break;

      case 'created-ascending':
        qb.orderBy('user.createdAt', 'ASC');
        break;

      case 'created-descending':
      default:
        qb.orderBy('user.createdAt', 'DESC');
    }

    qb.addOrderBy('address.id', 'DESC').addOrderBy('address.isDefault', 'DESC');

    return qb.getMany();
  }

  updateLocale(id: number, locale: Locale) {
    return this.update(id, { locale });
  }

  async update(id: number, updatedUser: DeepPartial<User>) {
    const result = await this.repo.update(id, updatedUser);
    if (!result.affected) throw NotFoundException('user.notFound');

    return this.getOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (!result.affected) throw NotFoundException('user.notFound');
  }

  private getOneByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  private async getOneByEmailOrFail(email: string) {
    const user = await this.getOneByEmail(email);
    if (!user) throw NotFoundException('user.notFound');

    return user;
  }
}
