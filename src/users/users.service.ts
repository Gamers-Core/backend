import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/entity';
import { CreateUserDTO } from 'src/auth';

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

  async update(id: number, updatedUser: Partial<User>) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updatedUser);

    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    if (!user) throw new NotFoundException('User not found');

    return this.repo.remove(user);
  }
}
