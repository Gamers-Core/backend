import { HttpException, HttpStatus } from '@nestjs/common';

import { I18nKey, Translate } from 'src/i18n';

export class AppException<T extends I18nKey = I18nKey> extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly translate: Translate<T>,
  ) {
    super({ status, message: translate }, status);
  }
}

export class BadRequestException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.BAD_REQUEST, message);
  }
}

export class NotFoundException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.NOT_FOUND, message);
  }
}

export class ConflictException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.CONFLICT, message);
  }
}

export class ForbiddenException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.FORBIDDEN, message);
  }
}

export class UnauthorizedException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.UNAUTHORIZED, message);
  }
}

export class ServiceUnavailableException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.SERVICE_UNAVAILABLE, message);
  }
}

export class InternalServerErrorException<T extends I18nKey> extends AppException<T> {
  constructor(message: Translate<T>) {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
  }
}
