import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

import { RequestManager, Response, ResponseError } from './types';
import { ServiceUnavailableException } from 'src/common';

const logger = new Logger('BostaErrorHandler');

export const requestManager: RequestManager = (instance) => ({
  get: <T, D>(url: string, config?: AxiosRequestConfig<D>) =>
    instance.get<Response<T>, AxiosResponse<Response<T>, D>, D>(url, config).then(({ data }) => data),
  post: <T, D>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    instance.post<Response<T>, AxiosResponse<Response<T>, D>, D>(url, data, config).then(({ data }) => data),
  put: <T, D>(url: string, data?: D, config?: AxiosRequestConfig<D>) =>
    instance.put<Response<T>, AxiosResponse<Response<T>, D>, D>(url, data, config).then(({ data }) => data),
  delete: <T, D>(url: string, config?: AxiosRequestConfig<D>) =>
    instance.delete<Response<T>, AxiosResponse<Response<T>, D>, D>(url, config).then(({ data }) => data),
});

export const errorHandler = (err: AxiosError<ResponseError>) => {
  const status = err.response?.status ?? err.status;
  const upstreamMessage = err.response?.data?.message ?? err.message;

  logger.error(`Bosta API request failed${status ? ` (status: ${status})` : ''}: ${upstreamMessage}`);

  throw new ServiceUnavailableException(['bosta.unavailable']);
};
