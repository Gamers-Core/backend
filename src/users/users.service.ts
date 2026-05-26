import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { NotFoundException } from 'src/common/exceptions';
import { isUniqueViolation } from 'src/common/helpers/db.helpers';
import { Locale } from 'src/i18n/types';

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

  getMailRecipients() {
    return this.repo.find({ select: { email: true, locale: true } });
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
