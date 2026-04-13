export interface NFTPurchaseDetails {
  nftAddress: string;
  collectionAddress?: string;
  sellerAddress: string;
  priceInTon: number;
  priceInUsd: number;
  nftContentUri?: string;
  nftName?: string;
}

export interface StripePaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

export interface TonPaymentDetails {
  transactionHash: string;
  senderAddress: string;
  amount: number;
  destinationAddress: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  nftAddress: string;
  buyerAddress: string;
  tonTransaction?: TonPaymentDetails;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  apiVersion?: string;
}

export interface TonConfig {
  network: 'mainnet' | 'testnet';
  apiKey?: string;
}

export interface CreatePaymentRequest {
  nft: NFTPurchaseDetails;
  buyerWalletAddress: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentStatus {
  paymentIntentId: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 
          'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  amount: number;
  currency: string;
  created: number;
  metadata: Record<string, string>;
}
