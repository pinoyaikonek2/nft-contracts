import { StripePaymentService } from './stripe.service';
import { StripeWebhookEvent, PaymentConfirmation, TonPaymentDetails } from './types';

export type WebhookEventHandler = (event: StripeWebhookEvent) => Promise<void>;

export interface WebhookHandlerConfig {
  stripeService: StripePaymentService;
  onPaymentSucceeded?: (confirmation: PaymentConfirmation) => Promise<void>;
  onPaymentFailed?: (event: StripeWebhookEvent) => Promise<void>;
  onPaymentProcessing?: (event: StripeWebhookEvent) => Promise<void>;
}

export class WebhookHandler {
  private stripeService: StripePaymentService;
  private handlers: WebhookHandlerConfig;

  constructor(handlers: WebhookHandlerConfig) {
    this.stripeService = handlers.stripeService;
    this.handlers = handlers;
  }

  async handleWebhook(payload: string, signature: string): Promise<{received: boolean; error?: string}> {
    try {
      const event = this.stripeService.verifyWebhookSignature(payload, signature);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event);
          break;
        case 'payment_intent.processing':
          await this.handlePaymentProcessing(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { received: false, error: errorMessage };
    }
  }

  private async handlePaymentSucceeded(event: StripeWebhookEvent): Promise<void> {
    const paymentIntent = event.data.object;
    
    const confirmation: PaymentConfirmation = {
      paymentIntentId: paymentIntent.id,
      nftAddress: paymentIntent.metadata.nftAddress,
      buyerAddress: paymentIntent.metadata.buyerWalletAddress,
      timestamp: Date.now(),
      status: 'completed'
    };

    if (this.handlers.onPaymentSucceeded) {
      await this.handlers.onPaymentSucceeded(confirmation);
    }
  }

  private async handlePaymentFailed(event: StripeWebhookEvent): Promise<void> {
    if (this.handlers.onPaymentFailed) {
      await this.handlers.onPaymentFailed(event);
    }
  }

  private async handlePaymentProcessing(event: StripeWebhookEvent): Promise<void> {
    if (this.handlers.onPaymentProcessing) {
      await this.handlers.onPaymentProcessing(event);
    }
  }

  async processWebhookEvent(event: StripeWebhookEvent): Promise<void> {
    await this.handleWebhook(
      JSON.stringify(event),
      ''
    );
  }
}

export function createWebhookHandler(config: WebhookHandlerConfig): WebhookHandler {
  return new WebhookHandler(config);
}
