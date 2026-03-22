import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { RequestManager, Response, ResponseError } from './types';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

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
  const message = err.response?.data.message || err.message;
  const errStatus = err.response?.status || err.status;

  switch (errStatus) {
    case 400:
      throw new BadRequestException(message);
    case 401:
      throw new UnauthorizedException('Unauthorized');
    case 403:
      throw new ForbiddenException('Forbidden');
    case 404:
      throw new NotFoundException('Not Found');
    case 500:
      throw new InternalServerErrorException('Internal Server Error');
    default:
      throw new HttpException(message, errStatus || 500);
  }
};
