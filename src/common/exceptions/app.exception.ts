import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends HttpException {
  constructor(
    public readonly errors: ValidationError[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ statusCode: status }, status);
  }
}

export class AppException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super({ statusCode: status, message }, status);
  }
}
