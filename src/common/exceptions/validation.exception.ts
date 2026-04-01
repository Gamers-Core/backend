import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ValidationException extends HttpException {
  constructor(
    public readonly errors: ValidationError[],
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ status }, status);
  }
}
