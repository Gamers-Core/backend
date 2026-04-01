import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { UsersService } from 'src/users';
import { withEnvironment, BadRequestException } from 'src/common';
import { Locale } from 'src/i18n';

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
      if (existingUser.length) throw new BadRequestException('auth.emailAlreadyUsed');

      return this.usersService.create({ name, email, password });
    },
  };

  async signup(userDTO: CreateUserDTO) {
    const [existingUser] = await this.usersService.find(userDTO.email);
    if (existingUser) throw new BadRequestException('auth.emailAlreadyUsed');

    const password = await getEncryptedPassword(userDTO.password);

    return withEnvironment(['local', 'development', 'staging'], async (isValid) => {
      if (isValid) {
        await this.otpVerifyHandlers['signup'](userDTO.email, { name: userDTO.name, password });

        return {
          purpose: 'signup' as const,
          sessionId: randomBytes(16).toString('hex'),
        };
      }

      return await this.otpSessionService.createSession({
        purpose: 'signup',
        email: userDTO.email,
        data: { name: userDTO.name, password },
      });
    });
  }

  async login(loginUserDTO: LoginUserDTO) {
    const [user] = await this.usersService.find(loginUserDTO.email);

    if (!user) throw new BadRequestException('auth.invalidCredentials');

    const [salt, hash] = user.password.split('.');

    const userHash = await getHashedPassword(loginUserDTO.password, salt);

    if (hash !== userHash.toString('hex')) throw new BadRequestException('auth.invalidCredentials');

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

    return withEnvironment(['local', 'development', 'staging'], async (isValid) => {
      if (isValid) {
        await this.otpVerifyHandlers['reset_password'](creds.email, { password });

        return {
          purpose: 'reset_password' as const,
          sessionId: randomBytes(16).toString('hex'),
        };
      }

      return await this.otpSessionService.createSession(
        {
          purpose: 'reset_password',
          email: creds.email,
          data: { password },
        },
        user.locale,
      );
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

  async resendOTP<P extends AuthPurpose>({ purpose, sessionId }: ResendOTPDTO<P>, locale?: Locale) {
    return withEnvironment(['local', 'development', 'staging'], async (isValid) => {
      if (isValid) return;

      return this.otpSessionService.resendSession<P>({ purpose, sessionId }, locale);
    });
  }
}
