import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { AppCacheService } from 'src/cache';

import { errorHandler, requestManager } from './helpers';
import { City, District, Instance, InsuranceFee, ShippingFees } from './types';
import { ShippingFeesDTO } from './dtos';

@Injectable()
export class BostaService {
  private readonly bosta: Instance;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: AppCacheService,
  ) {
    const api = this.httpService.axiosRef.create({
      baseURL: 'https://app.bosta.co/api/v2',
    });

    api.interceptors.request.use((config) => {
      const token = this.configService.get<string>('BOSTA_TOKEN');

      if (!token) throw new ServiceUnavailableException('BOSTA_TOKEN is not configured');

      config.headers.Authorization = `Bearer ${token}`;

      return config;
    });

    api.interceptors.response.use((res) => res, errorHandler);

    this.bosta = requestManager(api);
  }

  getCities() {
    return this.cacheService.getOrSet<City[]>(
      'bosta:cities',
      async () => await this.bosta.get<{ list: City[] }>('/cities').then((res) => res.data.list),
    );
  }

  getCity(id: string) {
    return this.getCities().then((cities) => cities.find(({ _id }) => _id === id));
  }

  getDistricts(cityId: string) {
    return this.cacheService.getOrSet<District[]>(
      `bosta:districts:${cityId}`,
      async () => await this.bosta.get<District[]>(`/cities/${cityId}/districts`).then((res) => res.data),
    );
  }

  getDistrict(id: string, cityId: string) {
    return this.getDistricts(cityId).then((districts) => districts.find(({ districtId }) => districtId === id));
  }

  getInsuranceFees(goodsValue: number) {
    return this.bosta
      .get<InsuranceFee>('/pricing/insuranceFeeEstimate', {
        params: { goodsValue },
      })
      .then((res) => res.data);
  }

  getShippingFees(params: ShippingFeesDTO) {
    return this.bosta
      .get<ShippingFees>('/pricing/shipment/calculator', { params: { ...params, size: 'Normal', type: 'SEND' } })
      .then((res) => res.data);
  }
}
