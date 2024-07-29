import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisClient from '@redis/client/dist/lib/client';
import { REDIS_DATABASE } from './redis.constant';

@Injectable()
export class RedisService
  extends RedisClient<{}, {}, {}>
  implements OnModuleInit, OnModuleDestroy
{
  private secret: string;
  constructor(private configService: ConfigService) {
    // const username = configService.get<string>('REDIS_USERNAME');
    const password = configService.get<string>('REDIS_PASSWORD');
    const host = configService.get<string>('REDIS_HOST');
    const port = configService.get<string>('REDIS_PORT');
    // console.log('connecting redis', `redis://${host}:${port}`, {
    //   password,
    // });

    super({
      // password,
      // TODO: set password for redis docker
      url: `redis://${host}:${port}`,
      database: REDIS_DATABASE.SESSION,
    });
    this.secret = configService.get<string>('REDIS_SECRET');
  }

  onModuleInit() {
    this.on('error', (err) => {
      console.error('REDIS SERVICE', err);
    }).connect();
  }

  onModuleDestroy() {
    this.quit();
  }

  hset(field: string, value: string) {
    return super.sendCommand<number>(['HSET', this.secret, field, value]);
  }

  hget(field: string) {
    return super.sendCommand<string>(['HGET', this.secret, field]);
  }
}
