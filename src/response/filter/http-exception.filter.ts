import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
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

    response.status(status).json({
      success: false,
      message: messages.join(':'),
      error_key: isEnum(error_key, ErrorKey) ? error_key : ErrorKey.INTERNAL,
    });
  }
}
