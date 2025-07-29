import {
  RESPONSE_MESSAGE,
  SKIP_TRANSFORM_KEY,
} from '@/common/decorator/customize';
import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  statusCode: number;
  message?: string;
  data: T;
  metadata?: any;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const shouldSkip = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (shouldSkip) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message:
          this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
          '',
        data,
        metadata: this.reflector.get<any>('metadata', context.getHandler()),
      })),
    );
  }
}
