import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/entity';
import { CreateUserDTO } from 'src/auth/dtos';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(userCred: CreateUserDTO) {
    const user = this.repo.create(userCred);

    return this.repo.save(user);
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async updateByEmail(email: string, updatedUser: Partial<CreateUserDTO>) {
    const [user] = await this.find(email);
    if (!user) return null;

    return this.updateUser(user, updatedUser);
  }

  async update(id: number, updatedUser: Partial<CreateUserDTO>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    return this.updateUser(user, updatedUser);
  }

  private async updateUser(user: User, updatedUser: Partial<CreateUserDTO>) {
    Object.assign(user, updatedUser);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    return this.repo.remove(user);
  }
}
