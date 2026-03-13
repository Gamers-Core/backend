import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import { compare, hash } from 'bcrypt';
import Redis from 'ioredis';

import { UsersService } from 'src/users';
import { REDIS_CLIENT } from 'src/redis';
import { MailService } from 'src/mail';

import { CreateUserDTO, LoginUserDTO, VerifyOTPDTO } from './dtos';
import { getEncryptedPassword, getHashedPassword } from './helpers';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
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

  getAuthIdKey(authId: string) {
    return `pwd-reset:${authId}`;
  }

  async forgotPassword({ email, password }: LoginUserDTO) {
    const [user] = await this.usersService.find(email);

    if (!user) throw new NotFoundException('User not found');

    const encryptedPassword = await getEncryptedPassword(password);

    const authId = randomBytes(16).toString('hex');

    const key = this.getAuthIdKey(authId);

    await this.redis.hmset(key, {
      purpose: 'reset_password',
      email,
      password: encryptedPassword,
    });

    await this.redis.expire(key, 600); // 10 minutes

    const otp = randomInt(100000, 999999).toString();
    const hashedOtp = await hash(otp, 10);

    await this.redis.hset(key, 'otp', hashedOtp, 'otp_attempts', 0);
    await this.redis.expire(key, 600);

    await this.mailService.sendTypedMail(email, 'reset-password', {
      code: otp,
    });

    return authId;
  }

  async verifyOTP({ authId, otp }: VerifyOTPDTO) {
    const key = this.getAuthIdKey(authId);
    const session = await this.redis.hgetall(key);

    if (!session || !session.email)
      throw new BadRequestException('Session expired');

    const attempts = parseInt(session.otp_attempts || '0', 10);
    if (attempts >= 5) {
      await this.redis.del(key);
      throw new BadRequestException('Too many attempts');
    }

    const isValid = await compare(otp, session.otp);
    if (!isValid) {
      await this.redis.hincrby(key, 'otp_attempts', 1);
      throw new BadRequestException('Invalid OTP');
    }

    const [user] = await this.usersService.find(session.email);
    if (!user) throw new BadRequestException('User not found');

    await this.usersService.update(user.id, { password: session.password });

    await this.redis.del(key);
  }

  async resendOTP(authId: string) {
    const key = this.getAuthIdKey(authId);
    const session = await this.redis.hgetall(key);

    if (!session || !session.email)
      throw new BadRequestException('Session expired');

    const resendCount = parseInt(session.otp_resend_count || '0', 10);
    if (resendCount >= 3)
      throw new BadRequestException('OTP resend limit reached');

    const lastSentAt = parseInt(session.otp_last_sent_at || '0', 10);
    const now = Date.now();

    if (lastSentAt && now - lastSentAt < 60_000)
      throw new BadRequestException('Please wait before resending OTP');

    const otp = randomInt(100000, 999999).toString();
    const hashedOtp = await hash(otp, 10);

    await this.redis.hmset(key, {
      otp: hashedOtp,
      otp_attempts: 0,
      otp_resend_count: resendCount + 1,
      otp_last_sent_at: now,
    });

    const ttl = await this.redis.ttl(key);
    if (ttl > 0) await this.redis.expire(key, ttl);

    await this.mailService.sendTypedMail(session.email, 'reset-password', {
      code: otp,
    });
  }
}
