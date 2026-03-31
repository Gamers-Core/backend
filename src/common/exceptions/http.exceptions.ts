import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    public message: string,
    status: HttpStatus,
  ) {
    super({ statusCode: status, message }, status);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(message: string) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
