import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { errorHandler, requestManager } from './helpers';
import { City, District, Instance } from './types';

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

  getCities() {
    return this.bosta
      .get<{ list: City[] }>('/cities')
      .then((res) => res.data.list);
  }

  getDistricts(cityId: string) {
    return this.bosta
      .get<District[]>(`/cities/${cityId}/districts`)
      .then((res) => res.data);
  }
}
