import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ServiceUnavailableException } from 'src/common/exceptions';

export abstract class AxiosService<TWrapper = void, TError = { message?: string }> {
  protected abstract readonly baseURL: string;

  private _instance: ReturnType<typeof this.httpService.axiosRef.create> | null = null;
  private _logger: Logger | null = null;

  constructor(protected readonly httpService: HttpService) {}

  private get logger() {
    this._logger ??= new Logger(this.constructor.name);

    return this._logger;
  }

  private createInstance() {
    const api = this.httpService.axiosRef.create({ baseURL: this.baseURL });

    api.interceptors.request.use((config) => this.onRequest(config));

    api.interceptors.response.use(
      (res) => res,
      (err: AxiosError) => this.onError(err),
    );

    return api;
  }

  protected extract?<T>(wrapper: TWrapper): T;

  private resolve<T>(res: AxiosResponse): T {
    return this.extract ? this.extract<T>(res.data) : (res.data as T);
  }

  private get instance() {
    this._instance ??= this.createInstance();

    return this._instance;
  }

  protected abstract onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig;

  protected extractError?(err: TError): string;

  protected onError(err: AxiosError): never {
    const status = err.response?.status;

    const data = err.response?.data as TError | undefined;
    const message =
      this.extractError && data
        ? this.extractError(data)
        : ((err.response?.data as { message?: string } | undefined)?.message ?? err.message);

    this.logger.error(`Request failed${status ? ` (${status})` : ''}: ${message}`);

    throw ServiceUnavailableException('service.unavailable');
  }

  protected get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get<T, AxiosResponse<T, never>>(url, config).then((res) => this.resolve<T>(res));
  }

  protected post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return this.instance.post<T, AxiosResponse<T, D>, D>(url, data, config).then((res) => this.resolve<T>(res));
  }

  protected put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return this.instance.put<T, AxiosResponse<T, D>, D>(url, data, config).then((res) => this.resolve<T>(res));
  }

  protected patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<T> {
    return this.instance.patch<T, AxiosResponse<T, D>, D>(url, data, config).then((res) => this.resolve<T>(res));
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete<T, AxiosResponse<T, never>>(url, config).then((res) => this.resolve<T>(res));
  }
}
