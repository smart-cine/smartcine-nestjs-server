import { Reflector } from '@nestjs/core';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Response } from './Response.decorator';
import { TResponse } from './Response.type';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<TResponse<any>>> {
    const responseOpts =
      this.reflector.get(Response, context.getHandler()) ?? {};

    return next.handle().pipe(
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
    );
  }
}
