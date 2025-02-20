export type Cart = {
  quotes: {
    id: string;
    types?: string[];
    note?: string;
  }[];
  shippingIds: string[];
  currency: string;
  note?: string;
  customerReference?: string;
  voucherCode?: string;
};

export type CartResponse = {
  cartId: string;
  countryCode: string;
  currency: string;
  estDeliveryTime: string;
  expiresAt: number;
  models: Model[];
  minimumProductionPrice: number;
  quotes: Quote[];
  shippings: Shipping[];
  items: Item[];
  amounts: Amounts;
};

export type CreateConfigurationRequest = {
  items: {
    modelId: string;
    quantity: number;
    scale?: number;
  }[];
};

export type CreateConfigurationResponse = {
  configurationId: string;
};

export type Configuration = {
  items: Item[];
};

export type Country = {
  code: string;
  name: string;
  region: string | null;
  blacklisted: boolean;
  defaultCurrency: string;
  codeThreeLetters: string;
};

export type HealthCheckResponse = {
  status: 'ok';
};

export type Inquiry = {
  title: string;
  description: string;
  vendorIds?: string[];
};

export type Model = {
  modelId: string;
  fileName: string;
  fileUnit: string;
  area: number | null;
  volume: number | null;
  dimensions: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  thumbnailUrl: string;
  sceneId: string | null;
  created: number;
  deleted: boolean;
};

export type ModelList = Model[];

export type ModelWithEmptyGeometry = Model & {
  area: null;
  volume: null;
  dimensions: {
    x: null;
    y: null;
    z: null;
  };
};

export type CreateOfferRequest = {
  cartId: string;
  expires?: boolean;
};

export type CreateOfferResponse = {
  offerId: string;
};

export type OrderResponse = {
  orderId: string;
  orderNumber: string;
  amounts: Amounts;
};

export type CreateOrderFromCart = {
  cartId: string;
  user: {
    emailAddress: string;
    shipping: ShippingInfo;
    billing: BillingInfo;
  };
  gaClientId?: string;
  customsInformation?: CustomsInformation;
};

export type OrderStatusResponse = {
  estDeliveryTime: string;
};

export type OrderStatusUpdateRequest = {
  vendorId: string;
  status: 'ordered' | 'in_production' | 'shipped' | 'received' | 'blocked' | 'cancelled';
  trackingUrl?: string;
  trackingNumber?: string;
}[];

export type AdditionalCostRequest = {
  vendorId: string;
  description: string;
  net: number;
};

export type AdditionalCostResponse = {
  vendorId: string;
  description: string;
  net: number;
  id: string;
  currency: string;
  status: {
    paid: boolean;
  };
  created: number;
  amounts: Amounts;
};

export type CreateInvoicePaymentRequest = {
  orderId: string;
  isTestOrder?: boolean;
  additionalCostId?: string;
};

export type CreateInvoicePaymentResponse = {
  paymentId: string;
  status: boolean;
};

export type ExecuteInvoicePaymentRequest = {
  token: string;
};

export type ExecuteInvoicePaymentResponse = {
  paymentId: string;
  status: boolean;
};

export type CreatePayPalPaymentRequest = {
  orderId: string;
  isTestOrder?: boolean;
  additionalCostId?: string;
};

export type CreatePayPalPaymentResponse = {
  paypalOrderId: string;
};

export type CapturePayPalPaymentResponse = {
  paymentId: string;
  paypalOrderId: string;
};

export type CreateStripePaymentRequest = {
  orderId: string;
  isTestOrder?: boolean;
  additionalCostId?: string;
};

export type CreateStripePaymentResponse = {
  id: string;
  url: string;
};

export type CreateAdyenPaymentRequest = {
  orderId: string;
  isTestOrder?: boolean;
  additionalCostId?: string;
};

export type CreateAdyenPaymentResponse = {
  id: string;
  sessionData: string;
};

export type SetAdyenPaymentAsyncRequest = {
  sessionResult: string;
};

export type CreatePriceRequest = {
  currency: string;
  countryCode: string;
  models: {
    modelId: string;
    quantity: number;
    scale?: number;
  }[];
  materialConfigIds?: string[];
  vendorIds?: string[];
  cartId?: string;
  ignoreUnknownMaterialConfigIds?: boolean;
};

export type CreatePriceResponse = {
  priceId: string;
};

export type GetPriceResponse = {
  expiresAt: number;
  allComplete: boolean;
  printingServiceComplete: Record<string, boolean>;
  quotes: Quote[];
  shippings: Shipping[];
  minimumProductionPrice: number;
};

export type GetGroupedPriceResponse = {
  expiresAt: number;
  allComplete: boolean;
  printingServiceComplete: Record<string, boolean>;
  printingService: Record<string, any>;
  minimumProductionPrice: Record<string, any>;
};

export type Provider = {
  vendorId: string;
  name: string;
  description: string;
  production: Record<string, any>;
  enabled: boolean;
  recommended: boolean;
  stateCode: string | null;
  premium: boolean;
  printingMethodIds: string[];
  specializations: string[];
  serviceOffers: string[];
  certifications: string[];
  profileImages: any[];
};

export type VoucherResponse = {
  code: string;
  campaign: string;
};

export type VoucherListResponse = {
  vouchers: VoucherResponse[];
  total: number;
};

export type ValidateVatIdRequest = {
  vatId: string;
};

export type ValidateVatIdResponse = {
  valid: boolean;
};

type Quote = {
  quoteId: string;
  vendorId: string;
  modelId: string;
  materialConfigId: string;
  price: number;
  quantity: number;
  currency: string;
  isPrintable: boolean;
  productionTimeFast: number;
  productionTimeSlow: number;
  scale: number;
};

type Shipping = {
  shippingId: string;
  vendorId: string;
  name: string;
  deliveryTime: string;
  price: number;
  currency: string;
  type: string;
};

type Item = {
  quoteId: string;
  types?: string[];
  note?: string;
};

type Amounts = {
  total: Total;
  totalByVendor: Record<string, Total>;
};

type Total = {
  totalNetPrice: number;
  totalGrossPrice: number;
  discount: number;
  vatPrice: number;
  vatPercentage: number;
  undiscountedNetProductionPrice: number;
  undiscountedNetShippingPrice: number;
  currency: string;
};

type ShippingInfo = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  countryCode: string;
  phoneNumber: string;
};

type BillingInfo = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  countryCode: string;
  companyName?: string;
  isCompany: boolean;
  vatId?: string;
};

type CustomsInformation = {
  description: string;
  industry: string;
};

export type UploadModelRequest = {
  file: File;
  unit?: 'mm' | 'cm' | 'in';
  refresh?: boolean;
};
