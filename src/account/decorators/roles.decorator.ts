import { Reflector } from '@nestjs/core';
import { AccountRole } from '@prisma/client';

export const Roles = Reflector.createDecorator<AccountRole[]>();
