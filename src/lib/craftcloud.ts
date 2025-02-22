import {
  Cart,
  CartResponse,
  Configuration,
  CreateConfigurationRequest,
  CreateConfigurationResponse,
  Country,
  HealthCheckResponse,
  Inquiry,
  Model,
  ModelList,
  ModelWithEmptyGeometry,
  CreateOfferRequest,
  CreateOfferResponse,
  OrderResponse,
  CreateOrderFromCart,
  OrderStatusResponse,
  OrderStatusUpdateRequest,
  AdditionalCostRequest,
  AdditionalCostResponse,
  CreateInvoicePaymentRequest,
  CreateInvoicePaymentResponse,
  ExecuteInvoicePaymentRequest,
  ExecuteInvoicePaymentResponse,
  CreatePayPalPaymentRequest,
  CreatePayPalPaymentResponse,
  CapturePayPalPaymentResponse,
  CreateStripePaymentRequest,
  CreateStripePaymentResponse,
  CreateAdyenPaymentRequest,
  CreateAdyenPaymentResponse,
  SetAdyenPaymentAsyncRequest,
  CreatePriceRequest,
  CreatePriceResponse,
  GetPriceResponse,
  GetGroupedPriceResponse,
  Provider,
  VoucherResponse,
  VoucherListResponse,
  ValidateVatIdResponse,
  UploadModelRequest,
} from './craftcloud-types';

export type Option = {
  quote: Quote;
  shipping: Shipping;
  totalCost: number;
  totalTime: number;
};

export type GetQuoteOptions = {
  modelUrl: string;
  countryCode: string;
  materialConfigIds?: string[];
  scale?: number;
  quantity?: number;
  currency?: 'EUR' | 'USD';
};

class CraftcloudClient {
  private baseURL: string;

  constructor() {
    this.baseURL = "https://api.craftcloud3d.com/v5";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createCart(cart: Cart): Promise<CartResponse> {
    return this.request<CartResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify(cart),
    });
  }

  async createConfiguration(configuration: CreateConfigurationRequest): Promise<CreateConfigurationResponse> {
    return this.request<CreateConfigurationResponse>('/configuration', {
      method: 'POST',
      body: JSON.stringify(configuration),
    });
  }

  async getConfiguration(configurationId: string): Promise<Configuration> {
    return this.request<Configuration>(`/configuration/${configurationId}`);
  }

  async getCountries(): Promise<Country[]> {
    return this.request<Country[]>('/country');
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health_check');
  }

  async createInquiry(inquiry: Inquiry): Promise<void> {
    return this.request<void>('/inquiry', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    });
  }

  async uploadModel({ file, unit = 'mm', refresh = false }: UploadModelRequest): Promise<ModelList> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unit', unit);
    formData.append('refresh', String(refresh));

    const response = await fetch(`${this.baseURL}/model`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getModel(modelId: string, refresh: boolean = false): Promise<Model | ModelWithEmptyGeometry> {
    return this.request<Model | ModelWithEmptyGeometry>(`/model/${modelId}?refresh=${refresh}`);
  }

  async deleteModel(modelId: string): Promise<Model> {
    return this.request<Model>(`/model/${modelId}`, {
      method: 'DELETE',
    });
  }

  async evolveModel(modelId: string, modelConfig: any): Promise<ModelList> {
    return this.request<ModelList>(`/model/${modelId}/evolve`, {
      method: 'POST',
      body: JSON.stringify(modelConfig),
    });
  }

  async getModelDownloadUrl(modelId: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/model/${modelId}/download`);
  }

  async createOffer(offer: CreateOfferRequest): Promise<CreateOfferResponse> {
    return this.request<CreateOfferResponse>('/offer', {
      method: 'POST',
      body: JSON.stringify(offer),
    });
  }

  async getOfferCart(offerId: string, currency?: string): Promise<CartResponse> {
    return this.request<CartResponse>(`/offer/${offerId}/cart?currency=${currency}`);
  }

  async getOfferConfiguration(offerId: string): Promise<Configuration> {
    return this.request<Configuration>(`/offer/${offerId}/configuration`);
  }

  async createOrderFromCart(order: CreateOrderFromCart): Promise<OrderResponse> {
    return this.request<OrderResponse>('/order', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async createManualOrder(order: any): Promise<OrderResponse> {
    return this.request<OrderResponse>('/order/manual', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    return this.request<OrderStatusResponse>(`/order/${orderId}/status`);
  }

  async updateOrderStatus(orderId: string, statusUpdates: OrderStatusUpdateRequest): Promise<void> {
    return this.request<void>(`/order/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusUpdates),
    });
  }

  async updateOrder(orderId: string, orderUpdate: any): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/order/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(orderUpdate),
    });
  }

  async getOrderConfiguration(orderId: string): Promise<Configuration> {
    return this.request<Configuration>(`/order/${orderId}/configuration`);
  }

  async triggerOrderPlacement(orderId: string, triggerData: any): Promise<void> {
    return this.request<void>(`/order/${orderId}/trigger`, {
      method: 'POST',
      body: JSON.stringify(triggerData),
    });
  }

  async createAdditionalCost(orderId: string, additionalCost: AdditionalCostRequest): Promise<AdditionalCostResponse> {
    return this.request<AdditionalCostResponse>(`/order/${orderId}/additionalCost`, {
      method: 'POST',
      body: JSON.stringify(additionalCost),
    });
  }

  async getAdditionalCost(orderId: string, additionalCostId: string): Promise<AdditionalCostResponse> {
    return this.request<AdditionalCostResponse>(`/order/${orderId}/additionalCost/${additionalCostId}`);
  }

  async createInvoicePayment(payment: CreateInvoicePaymentRequest): Promise<CreateInvoicePaymentResponse> {
    return this.request<CreateInvoicePaymentResponse>('/payment/invoice', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async executeInvoicePayment(paymentId: string, verification: ExecuteInvoicePaymentRequest): Promise<ExecuteInvoicePaymentResponse> {
    return this.request<ExecuteInvoicePaymentResponse>(`/payment/invoice/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(verification),
    });
  }

  async createPayPalPayment(payment: CreatePayPalPaymentRequest): Promise<CreatePayPalPaymentResponse> {
    return this.request<CreatePayPalPaymentResponse>('/payment/paypal', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async capturePayPalPayment(paypalOrderId: string): Promise<CapturePayPalPaymentResponse> {
    return this.request<CapturePayPalPaymentResponse>(`/payment/paypal/${paypalOrderId}/capture`);
  }

  async createStripePayment(payment: CreateStripePaymentRequest): Promise<CreateStripePaymentResponse> {
    return this.request<CreateStripePaymentResponse>('/payment/stripe', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async createAdyenPayment(payment: CreateAdyenPaymentRequest): Promise<CreateAdyenPaymentResponse> {
    return this.request<CreateAdyenPaymentResponse>('/payment/adyen', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async setAdyenPaymentAsync(adyenSessionId: string, sessionInformation: SetAdyenPaymentAsyncRequest): Promise<void> {
    return this.request<void>(`/payment/adyen/${adyenSessionId}/async`, {
      method: 'PATCH',
      body: JSON.stringify(sessionInformation),
    });
  }

  async createPriceRequest(priceRequest: CreatePriceRequest): Promise<CreatePriceResponse> {
    return this.request<CreatePriceResponse>('/price', {
      method: 'POST',
      body: JSON.stringify(priceRequest),
    });
  }

  async getPrice(priceId: string): Promise<GetPriceResponse> {
    return this.request<GetPriceResponse>(`/price/${priceId}`);
  }

  async getGroupedPrice(priceId: string): Promise<GetGroupedPriceResponse> {
    return this.request<GetGroupedPriceResponse>(`/price/${priceId}/grouped`);
  }

  async getProviders(): Promise<Provider[]> {
    return this.request<Provider[]>('/provider');
  }

  async generateReferralVoucher(): Promise<VoucherResponse> {
    return this.request<VoucherResponse>('/referral', {
      method: 'POST',
    });
  }

  async getReferralVouchers(): Promise<VoucherListResponse> {
    return this.request<VoucherListResponse>('/referral');
  }

  async validateVatId(vatId: string): Promise<ValidateVatIdResponse> {
    return this.request<ValidateVatIdResponse>('/vat-validation', {
      method: 'POST',
      body: JSON.stringify({ vatId }),
    });
  }

  async getQuote({
    modelUrl,
    countryCode,
    materialConfigIds = ['8c77dbf9-21a8-5342-87c1-fd685ec5fdd8'], // Default Resin material
    scale = 1,
    quantity = 1,
    currency = 'EUR'
  }: GetQuoteOptions): Promise<{
    cheapestOption: Option | null;
    fastestOption: Option | null;
  }> {
    // Upload model
    const modelFile = await fetch(modelUrl).then(res => res.blob()).then(blob => new File([blob], 'model.obj'));
    const uploadResponse = await this.uploadModel({ file: modelFile });
    const modelId = uploadResponse[0].modelId;

    // Create price request
    const priceRequest: CreatePriceRequest = {
      currency,
      countryCode,
      models: [{ modelId, quantity, scale }],
      materialConfigIds
    };

    const priceResponse = await this.createPriceRequest(priceRequest);
    const priceId = priceResponse.priceId;

    // Poll for price updates
    let priceData;
    let attempts = 0;
    const maxAttempts = 30; // 30s maximum waiting time

    while (attempts < maxAttempts) {
      priceData = await this.getPrice(priceId);
      if (priceData.allComplete) {
        break;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!priceData?.allComplete) {
      throw new Error('Price calculation timed out');
    }

    // Pair up quotes and shippings by vendorId
    const pairs = priceData.quotes.flatMap((quote: Quote) => 
      priceData.shippings
        .filter((shipping: Shipping) => shipping.vendorId === quote.vendorId)
        .map((shipping: Shipping) => ({ quote, shipping }))
    );

    // Find the cheapest and fastest options
    let cheapestOption: Option | null = null;
    let fastestOption: Option | null = null;

    pairs.forEach(({ quote, shipping }) => {
      const productionPrice = Math.max(quote.priceInclVat, priceData.minimumProductionPrice[quote.vendorId]?.priceInclVat || 0);
      const totalCost = productionPrice + shipping.priceInclVat;
      const totalTime = quote.productionTimeSlow + parseInt(shipping.deliveryTime.split('-')[1]);

      if (!cheapestOption || totalCost < cheapestOption.totalCost) {
        cheapestOption = { quote, shipping, totalCost, totalTime };
      }

      if (!fastestOption || totalTime < fastestOption.totalTime) {
        fastestOption = { quote, shipping, totalCost, totalTime };
      }
    });

    return { cheapestOption, fastestOption };
  }
}

export default CraftcloudClient;
