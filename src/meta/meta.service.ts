import { randomUUID } from 'crypto';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InternalAxiosRequestConfig } from 'axios';

import { AxiosService } from 'src/common/services/axios.service';
import { ConfigService } from 'src/config/config.service';

import { ConversionApiError, Event, SendEventsRequest, SendEventsResponse, SimpleEvent } from './types';

@Injectable()
export class MetaService extends AxiosService<unknown, ConversionApiError> {
  protected readonly baseURL = 'https://graph.facebook.com/v25.0';

  private get pixelId() {
    return this.configService.get('META_PIXEL_ID');
  }

  private get accessToken() {
    return this.configService.get('META_ACCESS_TOKEN');
  }

  constructor(
    httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super(httpService);
  }

  protected onRequest(config: InternalAxiosRequestConfig) {
    config.params = {
      ...config.params,
      access_token: this.accessToken,
    };

    return config;
  }

  protected extractError(err: ConversionApiError): string {
    return err.error.message;
  }

  sendEvents(events: Event[], testEventCode?: string) {
    const eventTime = Math.floor(Date.now() / 1000);

    return this.post<SendEventsResponse, SendEventsRequest>(`/${this.pixelId}/events`, {
      data: events.map((event) => ({
        ...event,
        event_id: event.event_id ?? randomUUID(),
        action_source: 'website',
        event_time: eventTime,
      })),
      ...(testEventCode && { test_event_code: testEventCode }),
    });
  }

  purchase(event: SimpleEvent, testEventCode?: string) {
    const frontendURL = this.configService.get('FRONTEND_URL');

    return this.sendEvents(
      [
        {
          event_name: 'Purchase',
          event_source_url: `${frontendURL}/checkout`,
          ...event,
        },
      ],
      testEventCode,
    );
  }
}
