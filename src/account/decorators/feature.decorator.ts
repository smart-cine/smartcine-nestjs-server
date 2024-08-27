import { Reflector } from '@nestjs/core';
import { FeatureFlag } from '@prisma/client';

export const Feature = Reflector.createDecorator<FeatureFlag | undefined>();
