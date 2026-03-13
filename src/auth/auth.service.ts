import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from 'src/users';

import { CreateUserDTO, LoginUserDTO, VerifyOTPDTO } from './dtos';
import { getEncryptedPassword, getHashedPassword } from './helpers';
import { OtpSessionService } from './otp-session';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpSessionService: OtpSessionService,
  ) {}

  async signup(userDTO: CreateUserDTO) {
    const user = await this.usersService.find(userDTO.email);
    if (user.length) throw new BadRequestException('Email is already used');

    const password = await getEncryptedPassword(userDTO.password);

    return this.usersService.create({ ...userDTO, password });
  }

  async login(loginUserDTO: LoginUserDTO) {
    const [user] = await this.usersService.find(loginUserDTO.email);

    if (!user) throw new BadRequestException('Invalid email or password');

    const [salt, hash] = user.password.split('.');

    const userHash = await getHashedPassword(loginUserDTO.password, salt);

    if (hash !== userHash.toString('hex'))
      throw new BadRequestException('Invalid email or password');

    return user;
  }

  async forgotPassword(creds: LoginUserDTO) {
    const [user] = await this.usersService.find(creds.email);

    if (!user) throw new NotFoundException('User not found');

    const password = await getEncryptedPassword(creds.password);

    const sessionId = await this.otpSessionService.createSession({
      purpose: 'reset_password',
      email: creds.email,
      data: { password },
    });

    return sessionId;
  }

  async verifyOTP({ sessionId, otp }: VerifyOTPDTO) {
    return this.otpSessionService
      .verifySession({
        purpose: 'reset_password',
        sessionId,
        otp,
      })
      .then(
        async ([email, { password }]) =>
          await this.usersService.updateByEmail(email, { password }),
      );
  }

  async resendOTP(sessionId: string) {
    return this.otpSessionService.resendSession({
      purpose: 'reset_password',
      sessionId,
    });
  }
}
