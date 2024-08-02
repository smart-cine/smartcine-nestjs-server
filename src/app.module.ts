import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilmModule } from './film/film.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtOptions } from './shared/JwtOptions';
import { RedisModule } from './redis/redis.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './account/guards/roles.guard';
import { ResponseInterceptor } from './response/Response.intercept';
import { PickseatModule } from './pickseat/pickseat.module';
import { PerformModule } from './perform/perform.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: true,
    }),
    // CacheModule.registerAsync(RedisOptions),
    PrismaModule,
    RedisModule,
    JwtModule.registerAsync(JwtOptions),
    AccountModule,
    FilmModule,
    PickseatModule,
    PerformModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          // transformOptions: { enableImplicitConversion: true },
        }),
    },
  ],
  controllers: [],
})
export class AppModule {}
