"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlphaToken, TokenListResponse, ChainId } from "@/lib/types";

interface UseTokensOptions {
  chain?: ChainId | null;
  search?: string;
  sortBy?: keyof AlphaToken;
  sortOrder?: "asc" | "desc";
  enabled?: boolean;
}

/**
 * 获取代币列表
 */
export function useTokens(options: UseTokensOptions = {}) {
  const { 
    chain, 
    search, 
    sortBy = "marketCap", 
    sortOrder = "desc",
    enabled = true,
  } = options;
  
  const queryClient = useQueryClient();
  
  const query = useQuery<TokenListResponse>({
    queryKey: ["tokens", { chain, search, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (chain) params.set("chain", chain);
      if (search) params.set("search", search);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);
      
      const response = await fetch(`/api/tokens?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch tokens");
      }
      
      return response.json();
    },
    enabled,
    staleTime: 30 * 1000, // 30秒
    refetchInterval: 60 * 1000, // 1分钟自动刷新
  });
  
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["tokens"] });
  };
  
  // 按链统计代币数量
  const tokenCountsByChain = (query.data?.tokens || []).reduce((acc, token) => {
    acc[token.chainId] = (acc[token.chainId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    tokens: query.data?.tokens || [],
    totalCount: query.data?.totalCount || 0,
    lastUpdated: query.data?.lastUpdated,
    tokenCountsByChain,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching && !query.isLoading,
    error: query.error,
    refresh,
  };
}

/**
 * 预取代币列表
 */
export function usePrefetchTokens() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: ["tokens", {}],
      queryFn: async () => {
        const response = await fetch("/api/tokens");
        return response.json();
      },
    });
  };
}
