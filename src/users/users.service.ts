import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from 'src/entity';
import { NotFoundException } from 'src/common';
import { type Locale } from 'src/i18n';
import { isUniqueViolation } from 'src/common/helpers';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findOrCreate(email: string) {
    const [user] = await this.find(email);
    if (user) return { user, isNewUser: false };

    try {
      const user = await this.create(email);

      return { user, isNewUser: true };
    } catch (e) {
      if (isUniqueViolation(e)) {
        const user = await this.findOneByEmailOrFail(email);

        return { user, isNewUser: false };
      }

      throw e;
    }
  }

  create(email: string) {
    const user = this.repo.create({ email });

    return this.repo.save(user);
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  findFull(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['addresses'] });
  }

  updateLocale(user: User, locale: Locale) {
    return this.updateUser(user, { locale });
  }

  async updateByEmail(email: string, updatedUser: Partial<User>) {
    const [user] = await this.find(email);
    if (!user) return null;

    return this.updateUser(user, updatedUser);
  }

  async update(id: number, updatedUser: DeepPartial<User>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('user.notFound');

    return this.updateUser(user, updatedUser);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('user.notFound');

    return this.repo.remove(user);
  }

  private async findOneByEmailOrFail(email: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('user.notFound');

    return user;
  }

  private async updateUser(user: User, updatedUser: DeepPartial<User>) {
    Object.assign(user, updatedUser);

    return this.repo.save(user);
  }
}
