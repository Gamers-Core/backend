import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';

import { translate } from 'src/i18n';

import { AppException, ValidationException } from '../exceptions';
import { formatErrors } from './helpers';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);

      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' });
    }

    const payload: Record<string, unknown> = {};

    const isValidationException = exception instanceof ValidationException;
    if (isValidationException) payload.errors = formatErrors(exception.errors);

    const isAppException = exception instanceof AppException;
    if (isAppException) payload.message = translate(exception.translate, request.locale);

    if (!isValidationException && !isAppException) payload.message = exception.message;

    const status = exception.getStatus();
    return response.status(status).json({ status, ...payload });
  }
}
