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
