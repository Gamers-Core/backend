import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { AppException, ValidationException } from '../exceptions';

function formatErrors(errors: ValidationError[]) {
  return errors.map((error) => ({
    property: error.property,
    constraints: error.constraints ?? {},
    children: error.children?.length ? formatErrors(error.children) : [],
  }));
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }

    const status = exception.getStatus();
    const json = { statusCode: status };

    const isValidationException = exception instanceof ValidationException;
    if (isValidationException) Object.assign(json, { errors: formatErrors(exception.errors) });

    const isAppException = exception instanceof AppException;
    if (isAppException) Object.assign(json, { message: exception.message });

    if (!isValidationException && !isAppException) {
      const body = exception.getResponse();
      Object.assign(json, { message: typeof body === 'string' ? body : (body as any).message });
    }

    return response.status(status).json(json);
  }
}
