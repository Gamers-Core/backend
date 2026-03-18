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
