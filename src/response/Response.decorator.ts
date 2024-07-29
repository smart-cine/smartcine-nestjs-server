import { Reflector } from '@nestjs/core';

export const Response = Reflector.createDecorator<{
  pagination?: boolean;
  message?: string;
}>();
