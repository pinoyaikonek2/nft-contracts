import Stripe from 'stripe';
import {
  StripeConfig,
  CreatePaymentRequest,
  StripePaymentIntent,
  NFTPurchaseDetails,
  PaymentStatus,
  StripeWebhookEvent
} from './types';

export class StripePaymentService {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion as Stripe.LatestApiVersion || '2023-10-16'
    });
  }

  async createPaymentIntent(request: CreatePaymentRequest): Promise<StripePaymentIntent> {
    const amountCents = Math.round(request.nft.priceInUsd * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true
      },
      metadata: {
        nftAddress: request.nft.nftAddress,
        buyerWalletAddress: request.buyerWalletAddress,
        sellerAddress: request.nft.sellerAddress,
        priceInTon: request.nft.priceInTon.toString(),
        collectionAddress: request.nft.collectionAddress || '',
        ...request.metadata
      },
      description: `NFT Purchase: ${request.nft.nftName || request.nft.nftAddress}`,
      return_url: request.successUrl
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    };
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentStatus> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status as PaymentStatus['status'],
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata
    };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentStatus> {
    const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

    return {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status as PaymentStatus['status'],
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      metadata: paymentIntent.metadata
    };
  }

  async createRefund(paymentIntentId: string, reason?: string): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        refundReason: reason || 'Customer requested refund'
      }
    });
  }

  verifyWebhookSignature(payload: string, signature: string): StripeWebhookEvent {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.webhookSecret
    );

    return event as unknown as StripeWebhookEvent;
  }

  async listPaymentIntents(limit: number = 10): Promise<Stripe.PaymentIntent[]> {
    const paymentIntents = await this.stripe.paymentIntents.list({ limit });
    return paymentIntents.data;
  }

  async getPaymentDetails(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }
}

export function createStripeService(config: StripeConfig): StripePaymentService {
  return new StripePaymentService(config);
}
