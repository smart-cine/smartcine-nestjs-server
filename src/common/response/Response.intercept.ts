import { Reflector } from '@nestjs/core';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadGatewayException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Response } from './Response.decorator';
import { TResponse } from './Response.type';
import { ErrorKey } from './constants/error-key';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<TResponse<any>>> {
    const responseOpts =
      this.reflector.get(Response, context.getHandler()) ?? {};

    return next
      .handle()
      .pipe(
        map((data) => {
          if (data?.data) {
            return {
              success: true,
              message: responseOpts.message ?? 'Success',
              data: data.data,
              ...data,
            };
          }

          return {
            success: true,
            message: responseOpts.message ?? 'Success',
            data: data,
          };
        }),
      )
      .pipe(
        catchError((err) => {
          const message = err?.message ?? 'Internal Server Error';
          const error_key = err?.error_key ?? ErrorKey.INTERNAL;
          console.error(err);

          if (err instanceof UnauthorizedException) {
            return throwError(
              () =>
                new HttpException(`${ErrorKey.UNAUTHORIZED}:${message}`, 401),
            );
          }

          return throwError(
            () => new HttpException(`${error_key}:${message}`, 500),
          );
        }),
      );
  }
}
