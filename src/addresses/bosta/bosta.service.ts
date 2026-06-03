import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { ShippingFeesResponseDTO } from 'src/addresses/dtos/shipping-fees-response.dto';
import { BostaPickupLocation } from 'src/addresses/types';
import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from 'src/config/config.service';
import { CacheService } from 'src/redis/cache.service';

import { ShippingFeesDTO } from '../dtos/shipping-fees.dto';

import {
  City,
  District,
  InsuranceFee,
  ShippingFees,
  CreateDelivery,
  DeliveryResponse,
  CreateDeliveryData,
  CreateDeliveryType,
  BostaResponse,
  BostaError,
} from './types';

@Injectable()
export class BostaService extends AxiosService<BostaResponse<unknown>, BostaError> {
  protected readonly baseURL = 'https://app.bosta.co/api/v2';

  constructor(
    readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    super(httpService);
  }

  protected onRequest(config: InternalAxiosRequestConfig) {
    config.headers.Authorization = this.configService.get('BOSTA_TOKEN');

    return config;
  }

  protected extract<T>(wrapper: BostaResponse<unknown>): T {
    return wrapper.data as T;
  }

  protected extractError(err: BostaError): string {
    return err.message ?? err.error;
  }

  getCities() {
    return this.cacheService.getOrSet<City[]>(
      'bosta:cities',
      async () => await this.get<{ list: City[] }>('/cities').then((res) => res.list),
      { ttlMs: 1000 * 60 * 60 * 24 },
    );
  }

  getCity(id: string) {
    return this.getCities().then((cities) => cities.find(({ _id }) => _id === id));
  }

  getDistricts(cityId: string) {
    return this.cacheService.getOrSet<District[]>(
      `bosta:districts:${cityId}`,
      async () => await this.get<District[]>(`/cities/${cityId}/districts`),
      { ttlMs: 1000 * 60 * 60 * 24 },
    );
  }

  getDistrict(id: string, cityId: string) {
    return this.getDistricts(cityId).then((districts) => districts?.find(({ districtId }) => districtId === id));
  }

  getInsuranceFees(goodsValue: number) {
    return this.get<InsuranceFee>('/pricing/insuranceFeeEstimate', { params: { goodsValue } });
  }

  async getShippingFees(params: ShippingFeesDTO): Promise<ShippingFeesResponseDTO> {
    const defaultPickupAddress = await this.getDefaultPickupLocation();

    const pickupCity = params.pickupCity ?? defaultPickupAddress?.address.city.name;

    const { shippingFee, extraCodFee, tier } = await this.get<ShippingFees>('/pricing/shipment/calculator', {
      params: { ...params, cod: String(params.cod), size: 'Normal', type: 'SEND', pickupCity },
    });

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
    return this.cacheService.getOrSet<BostaPickupLocation[]>(
      'bosta:pickup-locations',
      () => this.get<{ list: BostaPickupLocation[] }>('/pickup-locations').then((res) => res.list),
      { ttlMs: 1000 * 60 * 60 * 24 },
    );
  }

  getDefaultPickupLocation() {
    return this.getPickupLocations().then((locations) => locations.find(({ isDefault }) => isDefault) ?? locations[0]);
  }

  async createDelivery(props: CreateDelivery) {
    const defaultPickupAddress = await this.getDefaultPickupLocation();

    const delivery = await this.post<DeliveryResponse, CreateDeliveryData>('/deliveries?apiVersion=1', {
      businessLocationId: defaultPickupAddress._id,
      type: CreateDeliveryType.DELIVER,
      flexShippingInfo: {
        amountToBeCollected: 200,
        isOrderEligible: true,
      },
      notes: props.note,
      cod: props.cod,
      dropOffAddress: { cityId: props.cityId, districtId: props.districtId, firstLine: props.detailedAddress },
      goodsInfo: { amount: props.unitPrice },
      receiver: {
        phone: props.phoneNumber,
        fullName: props.nameAr,
      },
      businessReference: props.orderNumber,
      allowToOpenPackage: props.canOpenPackage,
    });

    return delivery;
  }
}
