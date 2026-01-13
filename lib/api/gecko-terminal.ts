/**
 * GeckoTerminal API 封装
 * 用于获取代币价格和市场数据的备选方案
 */

import type { ChainId } from "@/lib/types";

const GECKO_TERMINAL_BASE_URL = "https://api.geckoterminal.com/api/v2";

/** 链ID到GeckoTerminal网络名映射 */
const NETWORK_MAP: Record<string, string> = {
  "56": "bsc",
  "1": "eth",
  "8453": "base",
  "42161": "arbitrum",
  "137": "polygon_pos",
  "43114": "avax",
  "solana": "solana",
  "250": "ftm",
  "10": "optimism",
};

/**
 * 获取代币价格
 */
export async function fetchTokenPrice(
  chainId: ChainId,
  tokenAddress: string
): Promise<{
  price: number;
  priceChange24h: number;
} | null> {
  const network = NETWORK_MAP[chainId] || chainId;
  const url = `${GECKO_TERMINAL_BASE_URL}/simple/networks/${network}/token_price/${tokenAddress}?include_24hr_price_change=true`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json;version=20230302",
      },
      next: { revalidate: 30 },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const priceData = data.data?.attributes?.token_prices?.[tokenAddress.toLowerCase()];
    
    if (!priceData) return null;
    
    return {
      price: parseFloat(priceData) || 0,
      priceChange24h: 0, // GeckoTerminal 返回格式不同
    };
  } catch (error) {
    console.error("GeckoTerminal price fetch error:", error);
    return null;
  }
}

/**
 * 批量获取代币价格
 */
export async function fetchMultipleTokenPrices(
  chainId: ChainId,
  addresses: string[]
): Promise<Record<string, number>> {
  const network = NETWORK_MAP[chainId] || chainId;
  const batch = addresses.slice(0, 100).join(",");
  const url = `${GECKO_TERMINAL_BASE_URL}/simple/networks/${network}/token_price/${batch}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json;version=20230302",
      },
      next: { revalidate: 30 },
    });
    
    if (!response.ok) return {};
    
    const data = await response.json();
    const prices = data.data?.attributes?.token_prices || {};
    
    const result: Record<string, number> = {};
    for (const [address, price] of Object.entries(prices)) {
      result[address.toLowerCase()] = parseFloat(price as string) || 0;
    }
    
    return result;
  } catch (error) {
    console.error("GeckoTerminal batch price fetch error:", error);
    return {};
  }
}

/**
 * 获取代币详情
 */
export async function fetchTokenDetails(
  chainId: ChainId,
  tokenAddress: string
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  priceUsd: string;
  fdvUsd: string;
  totalReserveInUsd: string;
  volumeUsd24h: string;
  marketCapUsd: string;
} | null> {
  const network = NETWORK_MAP[chainId] || chainId;
  const url = `${GECKO_TERMINAL_BASE_URL}/networks/${network}/tokens/${tokenAddress}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json;version=20230302",
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data?.attributes || null;
  } catch (error) {
    console.error("GeckoTerminal token details error:", error);
    return null;
  }
}

/**
 * 获取新上市的池子
 */
export async function fetchNewPools(
  chainId: ChainId
): Promise<Array<{
  pairAddress: string;
  baseToken: { address: string; symbol: string };
  quoteToken: { address: string; symbol: string };
  createdAt: string;
}>> {
  const network = NETWORK_MAP[chainId] || chainId;
  const url = `${GECKO_TERMINAL_BASE_URL}/networks/${network}/new_pools`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json;version=20230302",
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data?.map((pool: any) => ({
      pairAddress: pool.attributes?.address,
      baseToken: pool.attributes?.base_token,
      quoteToken: pool.attributes?.quote_token,
      createdAt: pool.attributes?.pool_created_at,
    })) || [];
  } catch (error) {
    console.error("GeckoTerminal new pools error:", error);
    return [];
  }
}

/**
 * 获取热门池子
 */
export async function fetchTrendingPools(
  chainId: ChainId
): Promise<Array<{
  pairAddress: string;
  name: string;
  priceUsd: string;
  volumeUsd24h: string;
}>> {
  const network = NETWORK_MAP[chainId] || chainId;
  const url = `${GECKO_TERMINAL_BASE_URL}/networks/${network}/trending_pools`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json;version=20230302",
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.data?.map((pool: any) => ({
      pairAddress: pool.attributes?.address,
      name: pool.attributes?.name,
      priceUsd: pool.attributes?.base_token_price_usd,
      volumeUsd24h: pool.attributes?.volume_usd?.h24,
    })) || [];
  } catch (error) {
    console.error("GeckoTerminal trending pools error:", error);
    return [];
  }
}
