import { 
  StripeConfig, 
  CreatePaymentRequest, 
  NFTPurchaseDetails 
} from './types';

describe('Stripe Integration Types', () => {
  describe('NFTPurchaseDetails', () => {
    it('should create valid NFT purchase details', () => {
      const nft: NFTPurchaseDetails = {
        nftAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
        collectionAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
        sellerAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
        priceInTon: 10.5,
        priceInUsd: 25.00,
        nftContentUri: 'https://getgems.io/nft/123',
        nftName: 'Cool NFT #123'
      };

      expect(nft.nftAddress).toBeDefined();
      expect(nft.priceInTon).toBeGreaterThan(0);
      expect(nft.priceInUsd).toBeGreaterThan(0);
    });
  });

  describe('CreatePaymentRequest', () => {
    it('should create valid payment request', () => {
      const request: CreatePaymentRequest = {
        nft: {
          nftAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
          sellerAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
          priceInTon: 10,
          priceInUsd: 24.99
        },
        buyerWalletAddress: 'kQDiSfanFAN3IUZ6wIKy3KHo-inSdWU8oc0BI8TZPYUzNMRJ',
        successUrl: 'https://getgems.io/success',
        cancelUrl: 'https://getgems.io/cancel',
        metadata: {
          orderId: 'order_123'
        }
      };

      expect(request.nft).toBeDefined();
      expect(request.buyerWalletAddress).toBeDefined();
      expect(request.successUrl).toContain('https');
    });
  });

  describe('StripeConfig', () => {
    it('should create valid stripe config', () => {
      const config: StripeConfig = {
        secretKey: 'sk_test_xxxxx',
        webhookSecret: 'whsec_xxxxx',
        publishableKey: 'pk_test_xxxxx',
        apiVersion: '2023-10-16'
      };

      expect(config.secretKey).toContain('sk_test');
      expect(config.publishableKey).toContain('pk_test');
    });
  });
});
