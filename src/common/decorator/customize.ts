import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

export const SKIP_TRANSFORM_KEY = 'skipTransform';
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
