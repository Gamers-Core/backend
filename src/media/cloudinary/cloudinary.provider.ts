import { v2 as cloudinary } from 'cloudinary';

import { ConfigService } from 'src/config/config.service';

export const CLOUDINARY = Symbol('CLOUDINARY');

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    const cloud_name = configService.get('CLOUDINARY_CLOUD_NAME');
    const api_key = configService.get('CLOUDINARY_API_KEY');
    const api_secret = configService.get('CLOUDINARY_API_SECRET');

    cloudinary.config({ cloud_name, api_key, api_secret });

    return cloudinary;
  },
  inject: [ConfigService],
};
