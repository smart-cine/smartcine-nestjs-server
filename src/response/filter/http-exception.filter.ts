import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorKey } from '../constants/error-key';
import { isEnum } from 'class-validator';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const [error_key, ...messages] = exception.message.split(':');

    // Logger.error(`${request.method} ${request.url}`, exception.stack);
    console.log(`${request.method} ${request.url}`, exception.stack);

    response.status(status).json({
      success: false,
      message: messages.join(':') || 'Internal Server Error',
      error_key: isEnum(error_key, ErrorKey) ? error_key : ErrorKey.INTERNAL,
    });
  }
}
