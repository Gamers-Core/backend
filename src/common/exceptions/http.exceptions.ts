import { HttpStatus } from '@nestjs/common';

import { AppException } from './app.exception';

export const BadRequestException = (message: string) => new AppException(message, HttpStatus.BAD_REQUEST);
export const NotFoundException = (message: string) => new AppException(message, HttpStatus.NOT_FOUND);
export const ForbiddenException = (message: string) => new AppException(message, HttpStatus.FORBIDDEN);
export const UnauthorizedException = (message: string) => new AppException(message, HttpStatus.UNAUTHORIZED);
export const ConflictException = (message: string) => new AppException(message, HttpStatus.CONFLICT);
export const UnprocessableEntityException = (message: string) =>
  new AppException(message, HttpStatus.UNPROCESSABLE_ENTITY);
