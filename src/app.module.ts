import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilmModule } from './film/film.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtOptions } from './shared/JwtOptions';
import { RedisModule } from './redis/redis.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './account/guards/roles.guard';
import { ResponseInterceptor } from './response/Response.intercept';
import { PickseatModule } from './pickseat/pickseat.module';
import { PerformModule } from './perform/perform.module';
import { CinemaRoomModule } from './cinema-room/cinema-room.module';
import { CinemaModule } from './cinema/cinema.module';
import { CinemaProviderModule } from './cinema-provider/cinema-provider.module';
import { CinemaLayoutModule } from './cinema-layout/cinema-layout.module';
import { CinemaLayoutSeatModule } from './cinema-layout-seat/cinema-layout-seat.module';
import { CinemaLayoutGroupModule } from './cinema-layout-group/cinema-layout-group.module';
import { TagModule } from './tag/tag.module';
import { ItemModule } from './item/item.module';
import { CommentModule } from './comment/comment.module';
import { RatingModule } from './rating/rating.module';
import { JwtParserGuard } from './account/guards/jwt-parser.guard';
import { PermissionsGuard } from './account/guards/permissions.guard';
import { HttpExceptionFilter } from './response/filter/http-exception.filter';

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
    CinemaProviderModule,
    CinemaModule,
    CinemaRoomModule,
    CinemaLayoutModule,
    CinemaLayoutSeatModule,
    CinemaLayoutGroupModule,
    TagModule,
    ItemModule,
    CommentModule,
    RatingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtParserGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
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
