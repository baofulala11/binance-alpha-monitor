// ============================================
// 基础类型定义
// ============================================

/** 支持的区块链网络 */
export type ChainId = 
  | "56"      // BNB Chain
  | "1"       // Ethereum
  | "8453"    // Base
  | "42161"   // Arbitrum
  | "137"     // Polygon
  | "solana"  // Solana
  | "43114"   // Avalanche
  | string;

/** 链信息 */
export interface ChainInfo {
  id: ChainId;
  name: string;
  shortName: string;
  icon: string;
  explorerUrl: string;
  dexScreenerId: string;
}

// ============================================
// 币安 Alpha API 类型
// ============================================

/** 币安 Alpha 代币原始数据 */
export interface BinanceAlphaToken {
  alphaId: number;
  symbol: string;
  name: string;
  chainId: string;
  contractAddress: string;
  decimals?: number;
  logoUrl?: string;
}

/** 币安 Alpha API 响应 */
export interface BinanceAlphaResponse {
  code: string;
  message: string;
  data: BinanceAlphaToken[];
}

// ============================================
// DexScreener API 类型
// ============================================

/** DexScreener 代币信息 */
export interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
}

/** DexScreener 流动性数据 */
export interface DexScreenerLiquidity {
  usd: number;
  base: number;
  quote: number;
}

/** DexScreener 交易对数据 */
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  labels?: string[];
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceNative: string;
  priceUsd: string;
  txns: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: DexScreenerLiquidity;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    websites?: Array<{ url: string }>;
    socials?: Array<{ platform: string; handle: string }>;
  };
  boosts?: {
    active: number;
  };
}

// ============================================
// 聚合代币类型（用于前端展示）
// ============================================

/** LP（流动性池）信息 */
export interface LiquidityPoolInfo {
  dexId: string;
  dexName: string;
  pairAddress: string;
  quoteToken: string;
  liquidity: number;
  priceUsd: number;
  pairCreatedAt: number;
  url: string;
}

/** 聚合后的代币数据 */
export interface AlphaToken {
  // 基础信息 (from Binance Alpha)
  alphaId: number;
  symbol: string;
  name: string;
  chainId: ChainId;
  contractAddress: string;
  logoUrl?: string;
  
  // 市场数据 (from DexScreener)
  priceUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  liquidity: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  
  // 计算字段
  circulationRate: number | null;  // marketCap / fdv
  
  // 持有者数据 (from Birdeye/Moralis)
  holders: number | null;
  
  // 主要LP信息
  mainPool: LiquidityPoolInfo | null;
  allPools: LiquidityPoolInfo[];
  
  // 币安上架状态
  isSpotListed: boolean;
  isFuturesListed: boolean;
  
  // 时间信息
  listingTime: number | null;  // 首次上市时间
  
  // 链接
  dexScreenerUrl?: string;
  explorerUrl?: string;
}

/** 代币列表API响应 */
export interface TokenListResponse {
  tokens: AlphaToken[];
  lastUpdated: number;
  totalCount: number;
}

/** 代币详情API响应 */
export interface TokenDetailResponse {
  token: AlphaToken;
  priceHistory?: Array<{
    time: number;
    price: number;
  }>;
  holders?: Array<{
    address: string;
    balance: number;
    percentage: number;
  }>;
}

// ============================================
// 币安交易所信息类型
// ============================================

/** 币安现货交易对信息 */
export interface BinanceSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

/** 币安 exchangeInfo 响应 */
export interface BinanceExchangeInfo {
  symbols: BinanceSymbol[];
}

// ============================================
// API 请求/响应类型
// ============================================

/** 通用API错误 */
export interface ApiError {
  code: string;
  message: string;
}

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** 排序参数 */
export interface SortParams {
  sortBy?: keyof AlphaToken;
  sortOrder?: "asc" | "desc";
}

/** 筛选参数 */
export interface FilterParams {
  chainId?: ChainId;
  minMarketCap?: number;
  maxMarketCap?: number;
  minLiquidity?: number;
  isSpotListed?: boolean;
  isFuturesListed?: boolean;
  search?: string;
}

/** 代币列表请求参数 */
export interface TokenListParams extends PaginationParams, SortParams, FilterParams {}

// ============================================
// 持有者数据类型 (Birdeye/Moralis)
// ============================================

/** 持有者信息 */
export interface TokenHolder {
  address: string;
  balance: number;
  balanceUsd: number;
  percentage: number;
  isContract?: boolean;
}

/** 持有者统计 */
export interface HolderStats {
  totalHolders: number;
  topHolders: TokenHolder[];
  top10Percentage: number;
  top50Percentage: number;
}

// ============================================
// DEX 信息
// ============================================

/** DEX 平台信息 */
export const DEX_INFO: Record<string, { name: string; logo: string }> = {
  "pancakeswap": { name: "PancakeSwap", logo: "/dex/pancakeswap.png" },
  "uniswap": { name: "Uniswap", logo: "/dex/uniswap.png" },
  "raydium": { name: "Raydium", logo: "/dex/raydium.png" },
  "orca": { name: "Orca", logo: "/dex/orca.png" },
  "sushiswap": { name: "SushiSwap", logo: "/dex/sushiswap.png" },
  "quickswap": { name: "QuickSwap", logo: "/dex/quickswap.png" },
  "trader_joe": { name: "Trader Joe", logo: "/dex/traderjoe.png" },
  "aerodrome": { name: "Aerodrome", logo: "/dex/aerodrome.png" },
  "camelot": { name: "Camelot", logo: "/dex/camelot.png" },
};
