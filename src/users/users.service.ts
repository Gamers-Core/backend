import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { User } from 'src/entity';
import { NotFoundException } from 'src/common';
import { type Locale } from 'src/i18n';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

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

  private async updateUser(user: User, updatedUser: DeepPartial<User>) {
    Object.assign(user, updatedUser);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('user.notFound');

    return this.repo.remove(user);
  }
}
