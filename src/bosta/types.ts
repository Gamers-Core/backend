import { AxiosInstance, AxiosRequestConfig } from 'axios';

export type RequestManager = (instance: AxiosInstance) => {
  get: <T, D = undefined>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Response<T>>;
  post: <T, D = undefined>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Response<T>>;
  put: <T, D = undefined>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Response<T>>;
  delete: <T, D = undefined>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Response<T>>;
};

export type Instance = ReturnType<RequestManager>;

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ResponseError {
  message: string;
  error: string;
  statusCode: number;
  data: null;
}

export interface City {
  _id: string;
  name: string;
  nameAr: string;
  code: string;
  alias: string;
  hub: {
    _id: string;
    name: string;
  };
  sector: number;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
  showAsDropOff: boolean;
  showAsPickup: boolean;
}

export interface District {
  zoneId: string;
  zoneName: string;
  zoneOtherName: string;
  districtId: string;
  districtName: string;
  districtOtherName: string;
  pickupAvailability: boolean;
  dropOffAvailability: boolean;
}
