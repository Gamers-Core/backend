import { SetMetadata } from '@nestjs/common';

export const SKIP_MAINTENANCE = 'skipMaintenance';
export const SkipMaintenance = () => SetMetadata(SKIP_MAINTENANCE, true);
