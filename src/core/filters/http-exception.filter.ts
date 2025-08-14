import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Nếu là lỗi validation (message là mảng)
    if (
      typeof exceptionResponse === 'object' &&
      Array.isArray((exceptionResponse as any).message)
    ) {
      const messages = (exceptionResponse as any).message;
      const formattedErrors = {};

      for (const msg of messages) {
        const [field, ...rest] = msg.split(' ');
        //  const lowerField = field.toLowerCase();
        formattedErrors[field.toLowerCase()] = msg;
      }

      response.status(status).json({
        message: 'Validation failed',
        errorFields: formattedErrors,
      });
    } else {
      // Không phải lỗi validation, giữ nguyên định dạng gốc
      response.status(status).json({
        statusCode: status,
        message: (exceptionResponse as any).message || exception.message,
        error: 'Bad Request',
      });
    }
  }
}
