import { Address, Cell, toNano, BitString } from 'ton';
import { PaymentConfirmation, NFTPurchaseDetails, TonPaymentDetails } from './types';

const OFF_CHAIN_CONTENT_PREFIX = 0x01;

function makeSnakeCell(data: Buffer): Cell {
  const chunkSize = 127;
  let chunks: Buffer[] = [];
  while (data.byteLength > 0) {
    chunks.push(data.slice(0, chunkSize));
    data = data.slice(chunkSize);
  }
  
  let rootCell = new Cell();
  let curCell = rootCell;
  
  for (let i = 0; i < chunks.length; i++) {
    curCell.bits.writeBuffer(chunks[i]);
    if (chunks[i + 1]) {
      let nextCell = new Cell();
      curCell.refs.push(nextCell);
      curCell = nextCell;
    }
  }
  
  return rootCell;
}

export interface TonIntegrationConfig {
  network: 'mainnet' | 'testnet';
  marketplaceAddress: string;
  tonApiKey?: string;
}

export interface NftTransferParams {
  nftAddress: string;
  newOwnerAddress: string;
  forwardAmount?: bigint;
}

export interface SaleContractParams {
  marketplaceAddress: string;
  nftAddress: string;
  sellerAddress: string;
  price: bigint;
}

export class TonPaymentBridge {
  private config: TonIntegrationConfig;

  constructor(config: TonIntegrationConfig) {
    this.config = config;
  }

  async initiateNftTransfer(params: NftTransferParams): Promise<Cell> {
    const nftAddress = Address.parse(params.nftAddress);
    const newOwner = Address.parse(params.newOwnerAddress);
    
    const transferMessage = this.buildTransferMessage(newOwner, params.forwardAmount);
    
    return transferMessage;
  }

  private buildTransferMessage(newOwner: Address, forwardAmount?: bigint): Cell {
    const body = new Cell();
    body.bits.writeUint(0x5fcc3d14, 32);
    body.bits.writeUint(0, 64);
    body.bits.writeAddress(newOwner);
    body.bits.writeUint(0, 1);
    body.bits.writeCoins(forwardAmount || toNano('0.01'));
    body.bits.writeUint(0, 1);
    
    return body;
  }

  validateTonAddress(address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch {
      return false;
    }
  }

  async createSaleTransaction(params: SaleContractParams): Promise<{
    message: Cell;
    destination: Address;
    amount: bigint;
  }> {
    const nftAddress = Address.parse(params.nftAddress);
    const sellerAddress = Address.parse(params.sellerAddress);
    const marketplaceAddress = Address.parse(this.config.marketplaceAddress);
    
    const messageBody = this.buildSaleMessage(params.price);
    
    return {
      message: messageBody,
      destination: nftAddress,
      amount: params.price + toNano('0.25')
    };
  }

  private buildSaleMessage(price: bigint): Cell {
    const body = new Cell();
    body.bits.writeUint(0x1c8d7c8f, 32);
    body.bits.writeUint(0, 64);
    body.bits.writeCoins(price);
    
    return body;
  }

  async verifyPaymentCompletion(
    confirmation: PaymentConfirmation,
    expectedTonAmount: bigint
  ): Promise<boolean> {
    if (!confirmation.tonTransaction) {
      return false;
    }

    const txAmount = toNano(confirmation.tonTransaction.amount / 1e9);
    return txAmount >= expectedTonAmount;
  }

  getNetworkRpcUrl(): string {
    const urls = {
      mainnet: 'https://toncenter.com/api/v2/jsonRPC',
      testnet: 'https://testnet.toncenter.com/api/v2/jsonRPC'
    };
    return urls[this.config.network];
  }

  buildMarketplacePayload(
    nftAddress: string,
    buyerAddress: string,
    paymentIntentId: string
  ): Cell {
    const payload = new Cell();
    payload.bits.writeUint(0x9e3c6f1a, 32);
    payload.bits.writeAddress(Address.parse(nftAddress));
    payload.bits.writeAddress(Address.parse(buyerAddress));
    
    const stringData = Buffer.from(paymentIntentId);
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX]);
    const dataWithPrefix = Buffer.concat([offChainPrefix, stringData]);
    const stringCell = makeSnakeCell(dataWithPrefix);
    payload.refs.push(stringCell);
    
    return payload;
  }
}

export function createTonBridge(config: TonIntegrationConfig): TonPaymentBridge {
  return new TonPaymentBridge(config);
}
