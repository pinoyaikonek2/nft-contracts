import { StripePaymentService } from './stripe.service';
import { WebhookHandler } from './webhook.handler';
import { TonPaymentBridge, TonIntegrationConfig } from './ton-bridge';
import { 
  StripeConfig, 
  CreatePaymentRequest, 
  PaymentConfirmation,
  NFTPurchaseDetails
} from './types';

export interface StripeTonIntegrationConfig {
  stripe: StripeConfig;
  ton: TonIntegrationConfig;
}

export class StripeTonIntegration {
  private stripeService: StripePaymentService;
  private webhookHandler: WebhookHandler;
  private tonBridge: TonPaymentBridge;
  private config: StripeTonIntegrationConfig;

  constructor(config: StripeTonIntegrationConfig) {
    this.config = config;
    this.stripeService = new StripePaymentService(config.stripe);
    this.tonBridge = new TonPaymentBridge(config.ton);
    
    this.webhookHandler = new WebhookHandler({
      stripeService: this.stripeService,
      onPaymentSucceeded: this.handlePaymentSucceeded.bind(this)
    });
  }

  async initiatePurchase(request: CreatePaymentRequest): Promise<{
    clientSecret: string;
    paymentIntentId: string;
    tonPaymentData?: {
      destinationAddress: string;
      amount: string;
      payload: string;
    };
  }> {
    const paymentIntent = await this.stripeService.createPaymentIntent(request);
    
    const tonPaymentData = {
      destinationAddress: request.nft.sellerAddress,
      amount: request.nft.priceInTon.toString(),
      payload: this.tonBridge.buildMarketplacePayload(
        request.nft.nftAddress,
        request.buyerWalletAddress,
        paymentIntent.paymentIntentId
      ).toBoc().toString('base64')
    };

    return {
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      tonPaymentData
    };
  }

  private async handlePaymentSucceeded(confirmation: PaymentConfirmation): Promise<void> {
    console.log(`Payment succeeded for NFT ${confirmation.nftAddress}`);
    console.log(`Payment Intent ID: ${confirmation.paymentIntentId}`);
  }

  async handleWebhook(payload: string, signature: string): Promise<{received: boolean; error?: string}> {
    return await this.webhookHandler.handleWebhook(payload, signature);
  }

  getStripeService(): StripePaymentService {
    return this.stripeService;
  }

  getTonBridge(): TonPaymentBridge {
    return this.tonBridge;
  }
}

export function createIntegration(config: StripeTonIntegrationConfig): StripeTonIntegration {
  return new StripeTonIntegration(config);
}
