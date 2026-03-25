import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { AppCacheService } from 'src/cache';
import { BostaPickupLocation, ShippingFeesResponseDTO } from 'src/addresses';

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

      config.headers.Authorization = token;

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

  async getShippingFees(params: ShippingFeesDTO): Promise<ShippingFeesResponseDTO> {
    const pickupLocations = await this.getPickupLocations();
    const defaultPickupAddress = pickupLocations.find(({ isDefault }) => isDefault) ?? pickupLocations[0];

    if (!defaultPickupAddress && !params.pickupCity) {
      throw new ServiceUnavailableException('No pickup location available to calculate shipping fees');
    }

    const pickupCity = params.pickupCity ?? defaultPickupAddress?.address.city.name;

    const { shippingFee, extraCodFee, tier } = await this.bosta
      .get<ShippingFees>('/pricing/shipment/calculator', {
        params: { ...params, cod: String(params.cod), size: 'Normal', type: 'SEND', pickupCity },
      })
      .then((res) => res.data);

    return {
      shippingFee,
      codFee: extraCodFee?.amount ?? 0,
      openingFee: tier?.openingPackageFee?.amount ?? 0,
    };
  }

  async calculateShippingFees(cod: number, dropOffCity: string, isCOD: boolean, canOpenPackage: boolean) {
    const { shippingFee, codFee, openingFee } = await this.getShippingFees({ cod: String(cod), dropOffCity });

    let total = shippingFee;

    if (isCOD) total += codFee;
    if (canOpenPackage) total += openingFee;

    return total;
  }

  getPickupLocations() {
    return this.bosta.get<{ list: BostaPickupLocation[] }>('/pickup-locations').then((res) => res.data.list);
  }
}
