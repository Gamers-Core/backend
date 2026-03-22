import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { UsersService } from 'src/users';

import { CreateUserDTO, ForgotPasswordDTO, LoginUserDTO, ResendOTPDTO, VerifyOTPDTO } from './dtos';
import { getEncryptedPassword, getHashedPassword } from './helpers';
import { OtpSessionService } from './otp-session';
import { AuthPurpose, OtpVerifyHandlers, OtpVerifyResultByPurpose } from './types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private otpSessionService: OtpSessionService,
  ) {}

  private readonly otpVerifyHandlers: OtpVerifyHandlers = {
    reset_password: async (email, { password }) => {
      await this.usersService.updateByEmail(email, { password });
    },
    signup: async (email, { name, password }) => {
      const existingUser = await this.usersService.find(email);
      if (existingUser.length) throw new BadRequestException('Email is already used');

      return this.usersService.create({ name, email, password });
    },
  };

  async signup(userDTO: CreateUserDTO) {
    const existingUser = await this.usersService.find(userDTO.email);
    if (existingUser.length) throw new BadRequestException('Email is already used');

    const password = await getEncryptedPassword(userDTO.password);

    return await this.otpSessionService.createSession({
      purpose: 'signup',
      email: userDTO.email,
      data: { name: userDTO.name, password },
    });
  }

  async login(loginUserDTO: LoginUserDTO) {
    const [user] = await this.usersService.find(loginUserDTO.email);

    if (!user) throw new BadRequestException('Invalid email or password');

    const [salt, hash] = user.password.split('.');

    const userHash = await getHashedPassword(loginUserDTO.password, salt);

    if (hash !== userHash.toString('hex')) throw new BadRequestException('Invalid email or password');

    return user;
  }

  async forgotPassword(creds: ForgotPasswordDTO) {
    const password = await getEncryptedPassword(creds.password);

    const [user] = await this.usersService.find(creds.email);
    if (!user)
      return {
        purpose: 'reset_password' as const,
        sessionId: randomBytes(16).toString('hex'),
      };

    return await this.otpSessionService.createSession({
      purpose: 'reset_password',
      email: creds.email,
      data: { password },
    });
  }

  async verifyOTP<P extends AuthPurpose>({
    purpose,
    sessionId,
    otp,
  }: VerifyOTPDTO<P>): Promise<OtpVerifyResultByPurpose<P>> {
    const [email, data] = await this.otpSessionService.verifySession<P>({
      purpose,
      sessionId,
      otp,
    });

    return this.otpVerifyHandlers[purpose](email, data);
  }

  async resendOTP<P extends AuthPurpose>({ purpose, sessionId }: ResendOTPDTO<P>) {
    return this.otpSessionService.resendSession<P>({ purpose, sessionId });
  }
}
