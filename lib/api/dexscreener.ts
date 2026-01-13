/**
 * DexScreener API 封装
 * 文档: https://docs.dexscreener.com/api/reference
 */

import type { DexScreenerPair, ChainId } from "@/lib/types";

const DEXSCREENER_BASE_URL = "https://api.dexscreener.com";

/** 链ID到DexScreener链名映射 */
const CHAIN_MAP: Record<string, string> = {
  "56": "bsc",
  "1": "ethereum",
  "8453": "base",
  "42161": "arbitrum",
  "137": "polygon",
  "43114": "avalanche",
  "solana": "solana",
  "250": "fantom",
  "10": "optimism",
};

/**
 * 将链ID转换为DexScreener使用的链名
 */
export function getDexScreenerChain(chainId: ChainId): string {
  return CHAIN_MAP[chainId] || chainId.toLowerCase();
}

/**
 * 批量获取代币的交易对数据
 * @param chainId 链ID
 * @param addresses 代币地址数组（最多30个）
 */
export async function fetchTokensData(
  chainId: ChainId,
  addresses: string[]
): Promise<DexScreenerPair[]> {
  if (addresses.length === 0) return [];
  
  const chain = getDexScreenerChain(chainId);
  const batch = addresses.slice(0, 30).join(",");
  
  const url = `${DEXSCREENER_BASE_URL}/tokens/v1/${chain}/${batch}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
    next: { revalidate: 30 }, // 缓存30秒
  });
  
  if (!response.ok) {
    console.error(`DexScreener API error: ${response.status} for ${chain}`);
    return [];
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * 获取单个代币的所有交易对
 */
export async function fetchTokenPairs(
  chainId: ChainId,
  tokenAddress: string
): Promise<DexScreenerPair[]> {
  const chain = getDexScreenerChain(chainId);
  const url = `${DEXSCREENER_BASE_URL}/token-pairs/v1/${chain}/${tokenAddress}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
    next: { revalidate: 30 },
  });
  
  if (!response.ok) {
    console.error(`DexScreener API error: ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * 搜索代币/交易对
 */
export async function searchTokens(query: string): Promise<{
  schemaVersion: string;
  pairs: DexScreenerPair[];
}> {
  const url = `${DEXSCREENER_BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
    next: { revalidate: 60 },
  });
  
  if (!response.ok) {
    throw new Error(`DexScreener search error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * 获取单个交易对数据
 */
export async function fetchPairData(
  chainId: ChainId,
  pairAddress: string
): Promise<DexScreenerPair | null> {
  const chain = getDexScreenerChain(chainId);
  const url = `${DEXSCREENER_BASE_URL}/latest/dex/pairs/${chain}/${pairAddress}`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
    next: { revalidate: 30 },
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.pairs?.[0] || null;
}

/**
 * 获取最新的代币资料
 */
export async function fetchLatestTokenProfiles(): Promise<Array<{
  url: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  description?: string;
}>> {
  const url = `${DEXSCREENER_BASE_URL}/token-profiles/latest/v1`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });
  
  if (!response.ok) {
    return [];
  }
  
  return response.json();
}

/**
 * 从DexScreener数据中提取最佳交易对（流动性最高的）
 */
export function getBestPair(pairs: DexScreenerPair[]): DexScreenerPair | null {
  if (!pairs.length) return null;
  
  return pairs.reduce((best, current) => {
    const bestLiquidity = best.liquidity?.usd || 0;
    const currentLiquidity = current.liquidity?.usd || 0;
    return currentLiquidity > bestLiquidity ? current : best;
  }, pairs[0]);
}

/**
 * 从交易对数据中提取代币logo
 */
export function getTokenLogo(pairs: DexScreenerPair[]): string | undefined {
  for (const pair of pairs) {
    if (pair.info?.imageUrl) {
      return pair.info.imageUrl;
    }
  }
  return undefined;
}
