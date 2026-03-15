import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    const cloud_name = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = configService.get<string>('CLOUDINARY_API_KEY');
    const api_secret = configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloud_name || !api_key || !api_secret)
      throw new Error('Cloudinary configuration is missing.');

    return cloudinary.config({ cloud_name, api_key, api_secret });
  },
  inject: [ConfigService],
};
