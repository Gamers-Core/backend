import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

import { LocaleContextService, translate } from 'src/i18n';

import { AppException, ValidationException } from '../exceptions';
import { formatErrors } from './helpers';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly localeContext: LocaleContextService) {}

  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const locale = this.localeContext.locale;

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
    if (isAppException) payload.message = translate(exception.translate, locale);

    if (!isValidationException && !isAppException) {
      const body = exception.getResponse();

      if (typeof body === 'string') payload.message = body;
      else if ('message' in body && typeof body.message === 'string') payload.message = body.message;
    }

    const status = exception.getStatus();
    return response.status(status).json({ status, ...payload });
  }
}
