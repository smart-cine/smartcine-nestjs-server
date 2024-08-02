import { ConfigModule, ConfigService } from '@nestjs/config';

export const JwtOptions = {
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
  }),
  global: true,
  inject: [ConfigService],
};
