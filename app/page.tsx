"use client";

import { useState, useMemo, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { TokenTable } from "@/components/TokenTable";
import { ChainFilter } from "@/components/ChainFilter";
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
  
  // 获取数据
  const { 
    tokens, 
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
        tokenCount={totalCount}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        searchValue={search}
        onSearchChange={setSearch}
      />
      
      {/* 主内容 */}
      <main className="container py-6">
        {/* 链筛选 */}
        <div className="mb-6">
          <ChainFilter
            selectedChain={selectedChain}
            onChainChange={setSelectedChain}
            tokenCounts={tokenCountsByChain}
          />
        </div>
        
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
