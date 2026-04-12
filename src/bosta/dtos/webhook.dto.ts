import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nKeyValidator } from 'src/i18n';

import { deliveryTypes } from '../const';
import type { DeliveryType } from '../types';

export class WebhookDTO {
  @IsString({ message: i18nKeyValidator('isString') })
  _id: string;

  @IsString({ message: i18nKeyValidator('isString') })
  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  trackingNumber?: string;

  @IsNumber({}, { message: i18nKeyValidator('isNumber') })
  state: number;

  @IsString({ message: i18nKeyValidator('isString') })
  @IsIn(deliveryTypes, { message: i18nKeyValidator('isIn') })
  type: DeliveryType;

  @IsNumber({}, { message: i18nKeyValidator('isNumber') })
  cod: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsString({ message: i18nKeyValidator('isString') })
  businessReference: string;

  @IsNumber({}, { message: i18nKeyValidator('isNumber') })
  timeStamp: number;

  @IsBoolean({ message: i18nKeyValidator('isBoolean') })
  isConfirmedDelivery: boolean;

  @IsDateString({}, { message: i18nKeyValidator('isDateString') })
  deliveryPromiseDate: string;

  @IsNumber({}, { message: i18nKeyValidator('isNumber') })
  numberOfAttempts: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsNumber({}, { message: i18nKeyValidator('isNumber') })
  exceptionCode?: number;

  @IsOptional({ message: i18nKeyValidator('conditionalValidation') })
  @IsString({ message: i18nKeyValidator('isString') })
  exceptionReason?: string;
}
