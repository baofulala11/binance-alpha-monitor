"use client";

import { useQuery } from "@tanstack/react-query";
import type { AlphaToken, ChainId, LiquidityPoolInfo, HolderStats } from "@/lib/types";

interface TokenDetailResponse {
  token: AlphaToken;
  pools: LiquidityPoolInfo[];
  holderStats: HolderStats | null;
  lastUpdated: number;
}

/**
 * 获取单个代币详情
 */
export function useTokenDetail(
  address: string,
  chainId: ChainId = "56",
  enabled: boolean = true
) {
  return useQuery<TokenDetailResponse>({
    queryKey: ["token", address, chainId],
    queryFn: async () => {
      const params = new URLSearchParams({ chain: chainId });
      const response = await fetch(`/api/token/${address}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch token details");
      }
      
      return response.json();
    },
    enabled: enabled && !!address,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

interface LiquidityResponse {
  pools: Array<LiquidityPoolInfo & {
    volume24h: number;
    txns24h: { buys: number; sells: number };
    priceChange24h: number;
  }>;
  totalLiquidity: number;
  totalVolume24h: number;
  dexDistribution: Array<{
    dexId: string;
    dexName: string;
    liquidity: number;
    poolCount: number;
  }>;
  lastUpdated: number;
}

/**
 * 获取代币流动性详情
 */
export function useLiquidity(
  address: string,
  chainId: ChainId = "56",
  enabled: boolean = true
) {
  return useQuery<LiquidityResponse>({
    queryKey: ["liquidity", address, chainId],
    queryFn: async () => {
      const params = new URLSearchParams({ chain: chainId });
      const response = await fetch(`/api/liquidity/${address}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch liquidity data");
      }
      
      return response.json();
    },
    enabled: enabled && !!address,
    staleTime: 30 * 1000,
  });
}
