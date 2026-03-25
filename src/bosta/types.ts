import { AxiosInstance, AxiosRequestConfig } from 'axios';

export type RequestManager = (instance: AxiosInstance) => {
  get: <T, D = undefined>(url: string, config?: AxiosRequestConfig<D>) => Promise<Response<T>>;
  post: <T, D = undefined>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<Response<T>>;
  put: <T, D = undefined>(url: string, data?: D, config?: AxiosRequestConfig<D>) => Promise<Response<T>>;
  delete: <T, D = undefined>(url: string, config?: AxiosRequestConfig<D>) => Promise<Response<T>>;
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

export interface InsuranceFee {
  isInsuranceFeesAdded: boolean;
  insuranceFees: number;
}

export interface ShippingFees {
  tier: {
    _id: string;
    name: string;
    cost: number;
    zeroCodDiscount: { amount: number };
    extraCodFee: { percentage: number; codAmount: number; minimumFeeAmount: number };
    expediteFee: { percentage: number; minimumFeeAmount: number };
    insuranceFee: { percentage: number; minimumFeeAmount: number };
    codFee: { amount: number };
    posFee: { percentage: number; minimumFeeAmount: number };
    bostaMaterialFee: { amount: number };
    configurations: {
      zeroCodDiscount: boolean;
      extraCodFee: boolean;
      insuranceFee: boolean;
      expediteFee: boolean;
      codFee: boolean;
      posFee: boolean;
      paymentFrequency: string;
      paymentSchedule: any[];
      paymentTransferMethod: any[];
      weighting: string;
      bostaMaterialFee: boolean;
      restriction: Record<string, any>;
      openingPackageFee: boolean;
    };
    extraWeight: {
      weightThresholdInKg: number;
      costForWeightThreshold: number;
      costForAdditionalKgWeight: number;
      _id: string;
      excludeDeliveryTypesFromAdditionalWeighCostEnabled: boolean;
      excludedDeliveryTypesFromAdditionalWeighCost: any[];
    };
    country: {
      _id: string;
      name: string;
      nameAr: string;
      code: string;
      currency: string;
      vat: number;
    };
    isInitial: boolean;
    isDefault: boolean;
    deleted: boolean;
    openingPackageFee: { amount: number };
    createdAt: string;
    updatedAt: string;
    flexShipFee: { amount: number };
    pickupFee: { amount: number; numberOfOrdersThreshold: number };
  };
  size: {
    _id: string;
    name: string;
    alias: string;
    rate: string;
    cost: number;
    multiplier: number;
  };
  transit: {
    _id: string;
    originSectorId: number;
    destinationSectorId: number;
    cost: number;
  };
  serviceType: {
    _id: string;
    name: string;
    rate: string;
    cost: number;
  };
  extraCodFee: { amount: number; percentage: number };
  insuranceFee: { amount: number; percentage: number };
  expediteFee: { amount: number; percentage: number };
  shippingFee: number;
  isBostaMaterialFee: boolean;
  bostaMaterialFee: { amount: number };
  currency: string;
  vat: number;
  priceBeforeVat: number;
  priceAfterVat: number;
  sizeEffectCost: number;
  dropOffZoneFees: number;
  pickupZoneFees: number;
}

export enum DeliveryType {
  DELIVER = 10,
  CASH_COLLECTION = 15,
  EXCHANGE = 30,
  CUSTOMER_RETURN = 25,
}

export interface CreateDeliveryData {
  type: DeliveryType;
  specs?: {
    size?: 'SMALL' | 'MEDIUM' | 'LARGE' | 'Light Bulky' | 'Heavy Bulky';
    packageType?: 'Parcel' | 'Document' | 'Light Bulky' | 'Heavy Bulky';
    packageDetails?: {
      itemsCount?: number;
      description?: string;
    };
  };
  goodsInfo: {
    amount: number;
  };
  notes?: string;
  cod: number;
  dropOffAddress: {
    cityId: string;
    districtId: string;
    firstLine: string;
    city?: string;
    districtName?: string;
  };
  businessLocationId: string;

  allowToOpenPackage?: boolean;
  businessReference?: string;
  receiver: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    phone: string;
    email?: string;
  };
  webhookUrl?: string;
  webhookCustomHeaders?: {
    Authorization: string;
  };
  flexShippingInfo: {
    isOrderEligible: boolean;
    amountToBeCollected: number;
  };
}

export interface CreateDelivery {
  cod: number;
  cityId: string;
  districtId: string;
  detailedAddress: string;
  canOpenPackage: boolean;
  unitPrice: number;
  nameAr: string;
  phoneNumber: string;
  orderNumber: string;
  note?: string;
}

export interface DeliveryResponse {
  _id: string;
  trackingNumber: string;
  businessReference: string;
  sender: {
    _id: string;
    phone: string;
    name: string;
    type: string;
  };
  message: string;
  state: {
    code: number;
    value: string;
  };
  creationSrc: 'API';
}
