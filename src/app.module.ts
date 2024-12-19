import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilmModule } from './modules/film/film.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { AccountModule } from './modules/account/account.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtOptions } from './shared/JwtOptions';
import { RedisModule } from './common/redis/redis.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { RolesGuard } from './modules/account/guards/roles.guard';
import { ResponseInterceptor } from './common/response/Response.intercept';
import { PickseatModule } from './modules/pickseat/pickseat.module';
import { PerformModule } from './modules/perform/perform.module';
import { CinemaRoomModule } from './modules/cinema-room/cinema-room.module';
import { CinemaModule } from './modules/cinema/cinema.module';
import { CinemaProviderModule } from './modules/cinema-provider/cinema-provider.module';
import { CinemaLayoutModule } from './modules/cinema-layout/cinema-layout.module';
import { CinemaLayoutSeatModule } from './modules/cinema-layout-seat/cinema-layout-seat.module';
import { CinemaLayoutGroupModule } from './modules/cinema-layout-group/cinema-layout-group.module';
import { TagModule } from './modules/tag/tag.module';
import { ItemModule } from './modules/item/item.module';
import { CommentModule } from './modules/comment/comment.module';
import { RatingModule } from './modules/rating/rating.module';
import { JwtParserGuard } from './modules/account/guards/jwt-parser.guard';
import { HttpExceptionFilter } from './common/response/filter/http-exception.filter';
import { PaymentModule } from './modules/payment/payment.module';
import { OwnershipModule } from './common/ownership/ownership.module';
import { FeatureGuard } from './modules/account/guards/feature.guard';

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
    PaymentModule,
    OwnershipModule,
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
      useClass: FeatureGuard,
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
        }),
    },
  ],
  controllers: [],
})
export class AppModule {}
