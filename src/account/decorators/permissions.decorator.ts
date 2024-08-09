import { Reflector } from '@nestjs/core';
import { CinemaProviderPermission } from '@prisma/client';

export const Permissions =
  Reflector.createDecorator<CinemaProviderPermission>();
