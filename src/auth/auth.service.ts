import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users';
import { User } from 'src/entity';

import { CreateUserDTO, LoginUserDTO } from './dtos';
import { getEncryptedPassword, getHashedPassword } from './helpers';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async isLoggedIn(user: User | null) {
    if (!user) return false;

    return this.usersService.findOne(user.id);
  }

  async signup(userDTO: CreateUserDTO) {
    const user = await this.usersService.find(userDTO.email);
    if (user.length) throw new BadRequestException('Email is already used');

    const password = await getEncryptedPassword(userDTO.password);

    return this.usersService.create({ ...userDTO, password });
  }

  async login(loginUserDTO: LoginUserDTO) {
    const [user] = await this.usersService.find(loginUserDTO.email);

    if (!user) throw new NotFoundException('User not found');

    const [salt, hash] = user.password.split('.');

    const userHash = await getHashedPassword(loginUserDTO.password, salt);

    if (hash !== userHash.toString('hex'))
      throw new BadRequestException('Password is incorrect');

    return user;
  }
}
