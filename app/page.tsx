"use client";

import { useState, useMemo, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { TokenTable } from "@/components/TokenTable";
import { ChainFilter } from "@/components/ChainFilter";
import { AdvancedFilter, applyFilters, defaultFilterConditions, type FilterConditions } from "@/components/AdvancedFilter";
import { useTokens } from "@/hooks/useTokens";
import type { AlphaToken, ChainId } from "@/lib/types";
import { TooltipProvider } from "@/components/ui/tooltip";

// 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function HomeContent() {
  // 状态
  const [selectedChain, setSelectedChain] = useState<ChainId | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof AlphaToken>("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [advancedFilters, setAdvancedFilters] = useState<FilterConditions>(defaultFilterConditions);
  
  // 获取数据
  const { 
    tokens: rawTokens, 
    totalCount,
    lastUpdated,
    tokenCountsByChain,
    isLoading,
    isRefreshing,
    refresh,
  } = useTokens({
    chain: selectedChain,
    search,
    sortBy,
    sortOrder,
  });
  
  // 应用高级筛选
  const tokens = useMemo(() => {
    return applyFilters(rawTokens, advancedFilters) as AlphaToken[];
  }, [rawTokens, advancedFilters]);
  
  // 处理链筛选（同步到高级筛选）
  const handleChainChange = useCallback((chain: ChainId | null) => {
    setSelectedChain(chain);
    setAdvancedFilters(prev => ({
      ...prev,
      chainId: chain || "all",
    }));
  }, []);
  
  // 处理高级筛选变化
  const handleAdvancedFilterChange = useCallback((filters: FilterConditions) => {
    setAdvancedFilters(filters);
    // 同步链筛选
    if (filters.chainId === "all") {
      setSelectedChain(null);
    } else {
      setSelectedChain(filters.chainId as ChainId);
    }
  }, []);
  
  // 处理排序
  const handleSort = useCallback((key: keyof AlphaToken) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  }, [sortBy]);
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <Header
        lastUpdated={lastUpdated}
        tokenCount={tokens.length}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        searchValue={search}
        onSearchChange={setSearch}
      />
      
      {/* 主内容 */}
      <main className="container py-6">
        {/* 筛选栏 */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <ChainFilter
              selectedChain={selectedChain}
              onChainChange={handleChainChange}
              tokenCounts={tokenCountsByChain}
            />
          </div>
          <AdvancedFilter
            filters={advancedFilters}
            onFiltersChange={handleAdvancedFilterChange}
          />
        </div>
        
        {/* 筛选结果统计 */}
        {tokens.length !== totalCount && (
          <div className="mb-4 text-sm text-muted-foreground">
            显示 {tokens.length} / {totalCount} 个代币
          </div>
        )}
        
        {/* 代币表格 */}
        <div className="rounded-lg border bg-card">
          <TokenTable
            tokens={tokens}
            isLoading={isLoading}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>
        
        {/* 底部信息 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            数据来源: Binance Alpha API, DexScreener, GeckoTerminal
          </p>
          <p className="mt-1">
            数据每30秒自动刷新 · 点击流动性可查看LP详情
          </p>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <HomeContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
