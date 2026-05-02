import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

import { deliveryTypes } from 'src/bosta/const';
import type { DeliveryType } from 'src/bosta/types';

export class OrdersBostaWebhookDTO {
  @IsString()
  _id: string;

  @IsString()
  trackingNumber: string;

  @IsNumber()
  state: number;

  @IsString()
  @IsIn(deliveryTypes)
  type: DeliveryType;

  @IsNumber()
  cod: number;

  @IsOptional()
  @IsString()
  businessReference: string;

  @IsNumber()
  timeStamp: number;

  @IsBoolean()
  isConfirmedDelivery: boolean;

  @IsDateString()
  deliveryPromiseDate: string;

  @IsNumber()
  numberOfAttempts: number;

  @IsOptional()
  @IsNumber()
  exceptionCode?: number;

  @IsOptional()
  @IsString()
  exceptionReason?: string;
}
