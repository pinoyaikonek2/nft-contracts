# Stripe Payment Integration for GetGems NFT Marketplace

This package provides Stripe payment integration for purchasing NFTs on the GetGems marketplace using the TON blockchain.

## Features

- **Stripe Payment Intent Creation**: Create payment intents for NFT purchases
- **Webhook Handling**: Process Stripe webhook events for payment confirmations
- **TON Blockchain Integration**: Bridge between Stripe payments and TON NFT transfers
- **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install @getgems/stripe-integration
```

## Quick Start

```typescript
import { createIntegration } from '@getgems/stripe-integration';

const integration = createIntegration({
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  },
  ton: {
    network: 'mainnet',
    marketplaceAddress: 'YOUR_MARKETPLACE_ADDRESS'
  }
});

// Create a payment for NFT purchase
const result = await integration.initiatePurchase({
  nft: {
    nftAddress: 'NFT_ADDRESS',
    sellerAddress: 'SELLER_ADDRESS',
    priceInTon: 10.5,
    priceInUsd: 25.00
  },
  buyerWalletAddress: 'BUYER_WALLET_ADDRESS',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel'
});
```

## API Reference

### StripePaymentService

Handles all Stripe payment operations.

```typescript
const stripeService = integration.getStripeService();

// Create payment intent
await stripeService.createPaymentIntent(request);

// Get payment status
await stripeService.getPaymentStatus(paymentIntentId);

// Cancel payment
await stripeService.cancelPaymentIntent(paymentIntentId);

// Create refund
await stripeService.createRefund(paymentIntentId, 'Customer request');
```

### WebhookHandler

Handle Stripe webhook events.

```typescript
// Express.js example
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const result = await integration.handleWebhook(req.body, signature);
  res.json(result);
});
```

### TonPaymentBridge

TON blockchain integration utilities.

```typescript
const tonBridge = integration.getTonBridge();

// Validate TON address
tonBridge.validateTonAddress('EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS');

// Build marketplace payload
const payload = tonBridge.buildMarketplacePayload(nftAddress, buyerAddress, paymentIntentId);
```

## Environment Variables

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
TON_NETWORK=mainnet|testnet
MARKETPLACE_ADDRESS=EQBY...
TON_API_KEY=...
```

## Development

```bash
npm install
npm run build
npm test
```

## License

MIT
