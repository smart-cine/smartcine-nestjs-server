import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';

@Module({
  imports: [],
  controllers: [FilmController],
  providers: [FilmService],
})
export class FilmModule {}
