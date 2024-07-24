import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilmModule } from './film/film.module';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { RedisOptions } from './shared/RedisOptions';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtOptions } from './shared/JwtOptions';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.registerAsync(RedisOptions),
    JwtModule.registerAsync(JwtOptions),
    PrismaModule,
    FilmModule,
    AccountModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [],
})
export class AppModule {}
