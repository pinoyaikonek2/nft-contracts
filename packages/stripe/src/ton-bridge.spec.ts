import { TonPaymentBridge, TonIntegrationConfig } from './ton-bridge';

describe('TonPaymentBridge', () => {
  let bridge: TonPaymentBridge;
  const config: TonIntegrationConfig = {
    network: 'testnet',
    marketplaceAddress: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS'
  };

  beforeEach(() => {
    bridge = new TonPaymentBridge(config);
  });

  describe('validateTonAddress', () => {
    it('should validate correct mainnet address', () => {
      const validAddress = 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS';
      expect(bridge.validateTonAddress(validAddress)).toBe(true);
    });

    it('should validate correct testnet address', () => {
      const validAddress = 'kQDiSfanFAN3IUZ6wIKy3KHo-inSdWU8oc0BI8TZPYUzNMRJ';
      expect(bridge.validateTonAddress(validAddress)).toBe(true);
    });

    it('should reject invalid address', () => {
      const invalidAddress = 'invalid_address';
      expect(bridge.validateTonAddress(invalidAddress)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(bridge.validateTonAddress('')).toBe(false);
    });
  });

  describe('getNetworkRpcUrl', () => {
    it('should return testnet URL for testnet network', () => {
      const testnetBridge = new TonPaymentBridge({ ...config, network: 'testnet' });
      expect(testnetBridge.getNetworkRpcUrl()).toContain('testnet');
    });

    it('should return mainnet URL for mainnet network', () => {
      const mainnetBridge = new TonPaymentBridge({ ...config, network: 'mainnet' });
      expect(mainnetBridge.getNetworkRpcUrl()).toContain('toncenter.com');
    });
  });

  describe('buildMarketplacePayload', () => {
    it('should build valid marketplace payload', () => {
      const nftAddress = 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS';
      const buyerAddress = 'kQDiSfanFAN3IUZ6wIKy3KHo-inSdWU8oc0BI8TZPYUzNMRJ';
      const paymentIntentId = 'pi_1234567890';

      const payload = bridge.buildMarketplacePayload(nftAddress, buyerAddress, paymentIntentId);
      
      expect(payload).toBeDefined();
      expect(payload.toBoc()).toBeInstanceOf(Uint8Array);
    });
  });
});
