import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { errorHandler, requestManager } from './helpers';
import { Instance } from './types';

@Injectable()
export class BostaService {
  private readonly bosta: Instance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const api = this.httpService.axiosRef.create({
      baseURL: 'http://app.bosta.co/api/v2',
    });

    api.interceptors.request.use((config) => {
      const token = this.configService.get<string>('BOSTA_TOKEN');

      if (!token)
        throw new ServiceUnavailableException('BOSTA_TOKEN is not configured');

      config.headers.Authorization = `Bearer ${token}`;

      return config;
    });

    api.interceptors.response.use((res) => res, errorHandler);

    this.bosta = requestManager(api);
  }
}
