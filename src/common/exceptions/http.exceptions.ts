import { HttpException, HttpStatus } from '@nestjs/common';

import { I18nKey, Locale, Messages, Translate } from 'src/i18n/types';

export class AppException<T extends I18nKey = I18nKey> extends HttpException {
  constructor(
    status: HttpStatus,
    public readonly translate: Translate<T>,
  ) {
    super({ status, message: translate }, status);
  }
}

// export class BadRequestException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.BAD_REQUEST, message);
//   }
// }

// export class NotFoundException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.NOT_FOUND, message);
//   }
// }

// export class ConflictException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.CONFLICT, message);
//   }
// }

// export class ForbiddenException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.FORBIDDEN, message);
//   }
// }

// export class UnauthorizedException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.UNAUTHORIZED, message);
//   }
// }

// export class ServiceUnavailableException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.SERVICE_UNAVAILABLE, message);
//   }
// }

// export class InternalServerErrorException<T extends I18nKey> extends AppException<T> {
//   constructor(message: Translate<T>) {
//     super(HttpStatus.INTERNAL_SERVER_ERROR, message);
//   }
// }

const makeException =
  <S extends HttpStatus>(status: S) =>
  <T extends I18nKey>(message: Translate<T>): AppException<T> & { readonly message: Messages[Locale][T] } =>
    new AppException(status, message) as AppException<T> & { readonly message: Messages[Locale][T] };

export const BadRequestException = makeException(HttpStatus.BAD_REQUEST);
export const NotFoundException = makeException(HttpStatus.NOT_FOUND);
export const ConflictException = makeException(HttpStatus.CONFLICT);
export const ForbiddenException = makeException(HttpStatus.FORBIDDEN);
export const UnauthorizedException = makeException(HttpStatus.UNAUTHORIZED);
export const ServiceUnavailableException = makeException(HttpStatus.SERVICE_UNAVAILABLE);
export const InternalServerErrorException = makeException(HttpStatus.INTERNAL_SERVER_ERROR);
