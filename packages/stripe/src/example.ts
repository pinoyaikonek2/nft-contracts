import { 
  createIntegration, 
  StripeTonIntegration,
  StripeConfig,
  TonIntegrationConfig,
  CreatePaymentRequest
} from './index';

const stripeConfig: StripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here',
  apiVersion: '2023-10-16'
};

const tonConfig: TonIntegrationConfig = {
  network: (process.env.TON_NETWORK as 'mainnet' | 'testnet') || 'testnet',
  marketplaceAddress: process.env.MARKETPLACE_ADDRESS || 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
  tonApiKey: process.env.TON_API_KEY
};

const integration = createIntegration({
  stripe: stripeConfig,
  ton: tonConfig
});

async function examplePurchaseFlow() {
  const paymentRequest: CreatePaymentRequest = {
    nft: {
      nftAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
      collectionAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
      sellerAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
      priceInTon: 10.5,
      priceInUsd: 25.00,
      nftContentUri: 'https://getgems.io/nft/123',
      nftName: 'Cool NFT #123'
    },
    buyerWalletAddress: 'kQDiSfanFAN3IUZ6wIKy3KHo-inSdWU8oc0BI8TZPYUzNMRJ',
    successUrl: 'https://getgems.io/purchase/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'https://getgems.io/purchase/cancel',
    metadata: {
      orderId: 'order_' + Date.now(),
      marketplace: 'getgems'
    }
  };

  try {
    const result = await integration.initiatePurchase(paymentRequest);
    console.log('Payment Intent Client Secret:', result.clientSecret);
    console.log('Payment Intent ID:', result.paymentIntentId);
    
    if (result.tonPaymentData) {
      console.log('TON Payment Data:', result.tonPaymentData);
    }
    
    return result;
  } catch (error) {
    console.error('Error initiating purchase:', error);
    throw error;
  }
}

async function exampleWebhookHandler(payload: string, signature: string) {
  try {
    const result = await integration.handleWebhook(payload, signature);
    console.log('Webhook processed:', result);
    return result;
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
}

export {
  integration,
  examplePurchaseFlow,
  exampleWebhookHandler,
  stripeConfig,
  tonConfig
};
