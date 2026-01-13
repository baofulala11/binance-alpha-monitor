/**
 * Moralis API 封装
 * 用于获取EVM和Solana链的持有者数据
 * 文档: https://docs.moralis.com/
 * 
 * 注意: 需要 API Key
 */

import type { ChainId, TokenHolder } from "@/lib/types";

const MORALIS_EVM_BASE_URL = "https://deep-index.moralis.io/api/v2.2";
const MORALIS_SOLANA_BASE_URL = "https://solana-gateway.moralis.io";

/**
 * 获取API Key
 */
function getApiKey(): string {
  return process.env.MORALIS_API_KEY || "";
}

/**
 * 获取EVM链名
 */
function getEvmChain(chainId: ChainId): string | null {
  const chainMap: Record<string, string> = {
    "1": "eth",
    "56": "bsc",
    "137": "polygon",
    "43114": "avalanche",
    "42161": "arbitrum",
    "10": "optimism",
    "8453": "base",
    "250": "fantom",
  };
  return chainMap[chainId] || null;
}

/**
 * 获取EVM代币持有者
 */
export async function fetchEvmTokenHolders(
  chainId: ChainId,
  tokenAddress: string,
  limit: number = 100
): Promise<{
  holders: TokenHolder[];
  totalCount: number;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Moralis API key not configured");
    return { holders: [], totalCount: 0 };
  }
  
  const chain = getEvmChain(chainId);
  if (!chain) {
    return { holders: [], totalCount: 0 };
  }
  
  const url = `${MORALIS_EVM_BASE_URL}/erc20/${tokenAddress}/owners?chain=${chain}&limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": apiKey,
      },
      next: { revalidate: 300 },
    });
    
    if (!response.ok) {
      console.error(`Moralis EVM holders error: ${response.status}`);
      return { holders: [], totalCount: 0 };
    }
    
    const data = await response.json();
    
    const holders: TokenHolder[] = data.result?.map((item: any) => ({
      address: item.owner_address,
      balance: parseFloat(item.balance_formatted) || 0,
      balanceUsd: parseFloat(item.usd_value) || 0,
      percentage: parseFloat(item.percentage_relative_to_total_supply) || 0,
      isContract: item.is_contract || false,
    })) || [];
    
    return {
      holders,
      totalCount: data.total || holders.length,
    };
  } catch (error) {
    console.error("Moralis EVM holders fetch error:", error);
    return { holders: [], totalCount: 0 };
  }
}

/**
 * 获取Solana代币持有者
 */
export async function fetchSolanaTokenHolders(
  tokenAddress: string,
  limit: number = 100
): Promise<{
  holders: TokenHolder[];
  totalCount: number;
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Moralis API key not configured");
    return { holders: [], totalCount: 0 };
  }
  
  const url = `${MORALIS_SOLANA_BASE_URL}/token/mainnet/holders/${tokenAddress}?limit=${limit}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": apiKey,
      },
      next: { revalidate: 300 },
    });
    
    if (!response.ok) {
      console.error(`Moralis Solana holders error: ${response.status}`);
      return { holders: [], totalCount: 0 };
    }
    
    const data = await response.json();
    
    const holders: TokenHolder[] = data.result?.map((item: any) => ({
      address: item.owner,
      balance: parseFloat(item.amount) || 0,
      balanceUsd: parseFloat(item.usd_value) || 0,
      percentage: parseFloat(item.percentage) || 0,
    })) || [];
    
    return {
      holders,
      totalCount: data.total || holders.length,
    };
  } catch (error) {
    console.error("Moralis Solana holders fetch error:", error);
    return { holders: [], totalCount: 0 };
  }
}

/**
 * 获取代币持有者数量
 */
export async function fetchTokenHolderCount(
  chainId: ChainId,
  tokenAddress: string
): Promise<number> {
  if (chainId === "solana") {
    const result = await fetchSolanaTokenHolders(tokenAddress, 1);
    return result.totalCount;
  } else {
    const result = await fetchEvmTokenHolders(chainId, tokenAddress, 1);
    return result.totalCount;
  }
}

/**
 * 获取代币元数据 (EVM)
 */
export async function fetchEvmTokenMetadata(
  chainId: ChainId,
  tokenAddress: string
): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
  totalSupply: string;
} | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }
  
  const chain = getEvmChain(chainId);
  if (!chain) {
    return null;
  }
  
  const url = `${MORALIS_EVM_BASE_URL}/erc20/metadata?chain=${chain}&addresses[]=${tokenAddress}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "X-API-Key": apiKey,
      },
      next: { revalidate: 3600 }, // 缓存1小时
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const token = data[0];
    
    if (!token) return null;
    
    return {
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      logo: token.logo || token.thumbnail,
      totalSupply: token.total_supply,
    };
  } catch (error) {
    console.error("Moralis metadata error:", error);
    return null;
  }
}

/**
 * 检查是否配置了 Moralis API
 */
export function isMoralisConfigured(): boolean {
  return !!getApiKey();
}
