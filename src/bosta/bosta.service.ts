import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosInstance } from 'axios';

@Injectable()
export class BostaService {
  private readonly bosta: AxiosInstance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.bosta = this.httpService.axiosRef.create({
      baseURL: 'http://app.bosta.co/api/v2',
      timeout: 10000,
    });

    this.bosta.interceptors.request.use((config) => {
      const token = this.configService.get<string>('BOSTA_TOKEN');

      if (!token)
        throw new ServiceUnavailableException('BOSTA_TOKEN is not configured');

      config.headers.Authorization = `Bearer ${token}`;

      return config;
    });
  }
}
