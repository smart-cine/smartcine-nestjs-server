import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { withOptimize } from '@prisma/extension-optimize';
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    // this.$extends(withOptimize({ enable: true }));
    // this.$use(this.categorySoftDeleteMiddleware);
    // this.$use(this.categoryFindMiddleware);
    // this.$extends({
    //   name: 'stringify-uuid',
    //   result: {

    //     $allModels: {
    //       getId() {
    //         return this.id.toString();
    //       },
    //     },
    //   },
    // });

    this.$on('error', ({ message }) => {
      this.logger.error(message);
    });
    this.$on('warn', ({ message }) => {
      this.logger.warn(message);
    });
    this.$on('info', ({ message }) => {
      this.logger.debug(message);
    });
    // this.$on('query', ({ query, params }) => {
    //   this.logger.log(`${query}; ${params}`);
    // });

    this.$on('query', (e) => {
      this.logger.log(`[⌚${e.duration}ms] ${e.query} ${e.params}`);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
