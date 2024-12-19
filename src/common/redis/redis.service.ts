import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import RedisClient from '@redis/client/dist/lib/client';

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
    });
    this.secret = configService.get<string>('REDIS_SECRET')!;
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
    console.log(['HGET', this.secret, field]);
    return super.sendCommand<string>(['HGET', this.secret, field]) as Promise<
      string | null
    >;
  }

  async isBlacklisted(token: string) {
    return (
      (await this.sendCommand<string>(['EXISTS', `loggedout:${token}`])) === '1'
    );
  }

  async blacklist(token: string) {
    return this.sendCommand<string>(['SET', `loggedout:${token}`, '']);
  }
}
