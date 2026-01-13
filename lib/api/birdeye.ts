/**
 * Birdeye API 封装
 * 用于获取持有者数据和市场数据
 * 文档: https://docs.birdeye.so/reference
 * 
 * 注意: 需要 API Key
 */

import type { ChainId, TokenHolder, HolderStats } from "@/lib/types";

const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";

/** 链ID到Birdeye链名映射 */
const CHAIN_MAP: Record<string, string> = {
  "solana": "solana",
  "1": "ethereum",
  "56": "bsc",
  "8453": "base",
  "42161": "arbitrum",
  "137": "polygon",
  "43114": "avalanche",
};

/**
 * 获取API Key
 */
function getApiKey(): string {
  return process.env.BIRDEYE_API_KEY || "";
}

/**
 * 获取请求头
 */
function getHeaders(chainId: ChainId) {
  const chain = CHAIN_MAP[chainId] || "solana";
  return {
    "Accept": "application/json",
    "X-API-KEY": getApiKey(),
    "x-chain": chain,
  };
}

/**
 * 获取代币持有者列表
 */
export async function fetchTokenHolders(
  chainId: ChainId,
  tokenAddress: string,
  limit: number = 20,
  offset: number = 0
): Promise<TokenHolder[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Birdeye API key not configured");
    return [];
  }
  
  const url = `${BIRDEYE_BASE_URL}/defi/v3/token/holder?address=${tokenAddress}&offset=${offset}&limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: getHeaders(chainId),
      next: { revalidate: 300 }, // 缓存5分钟
    });
    
    if (!response.ok) {
      console.error(`Birdeye holders API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.success) return [];
    
    return data.data?.items?.map((item: any) => ({
      address: item.owner,
      balance: parseFloat(item.uiAmount) || 0,
      balanceUsd: parseFloat(item.valueUsd) || 0,
      percentage: parseFloat(item.percentage) || 0,
      isContract: item.isContract || false,
    })) || [];
  } catch (error) {
    console.error("Birdeye holders fetch error:", error);
    return [];
  }
}

/**
 * 获取持有者统计信息
 */
export async function fetchHolderStats(
  chainId: ChainId,
  tokenAddress: string
): Promise<HolderStats | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  const holders = await fetchTokenHolders(chainId, tokenAddress, 50);
  
  if (!holders.length) return null;
  
  const top10 = holders.slice(0, 10);
  const top50 = holders.slice(0, 50);
  
  return {
    totalHolders: 0, // 需要单独API调用
    topHolders: holders.slice(0, 20),
    top10Percentage: top10.reduce((sum, h) => sum + h.percentage, 0),
    top50Percentage: top50.reduce((sum, h) => sum + h.percentage, 0),
  };
}

/**
 * 获取代币市场数据
 */
export async function fetchTokenMarketData(
  chainId: ChainId,
  tokenAddress: string
): Promise<{
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  holders: number;
} | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  const url = `${BIRDEYE_BASE_URL}/defi/v3/token/market-data?address=${tokenAddress}`;
  
  try {
    const response = await fetch(url, {
      headers: getHeaders(chainId),
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (!data.success) return null;
    
    return {
      price: data.data?.price || 0,
      priceChange24h: data.data?.priceChange24hPercent || 0,
      volume24h: data.data?.volume24h || 0,
      marketCap: data.data?.marketCap || 0,
      fdv: data.data?.fdv || 0,
      liquidity: data.data?.liquidity || 0,
      holders: data.data?.holder || 0,
    };
  } catch (error) {
    console.error("Birdeye market data error:", error);
    return null;
  }
}

/**
 * 获取代币概览
 */
export async function fetchTokenOverview(
  chainId: ChainId,
  tokenAddress: string
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  price: number;
  history24hPrice: number;
  priceChange24hPercent: number;
  liquidity: number;
  mc: number;
  realMc: number;
  supply: number;
  circulatingSupply: number;
  holder: number;
  v24hUSD: number;
} | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  const url = `${BIRDEYE_BASE_URL}/defi/token_overview?address=${tokenAddress}`;
  
  try {
    const response = await fetch(url, {
      headers: getHeaders(chainId),
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Birdeye overview error:", error);
    return null;
  }
}

/**
 * 检查是否配置了 Birdeye API
 */
export function isBirdeyeConfigured(): boolean {
  return !!getApiKey();
}
