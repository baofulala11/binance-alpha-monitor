"use client";

import { useParams, useSearchParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useTokenDetail, useLiquidity } from "@/hooks/useTokenDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChainBadge } from "@/components/ChainBadge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  formatCurrency, 
  formatPrice, 
  formatPriceChange,
  formatNumber,
  formatAddress,
  formatTimeAgo,
  copyToClipboard,
} from "@/lib/utils/format";
import { getTokenExplorerUrl, getDexScreenerUrl } from "@/lib/utils/chains";
import type { ChainId } from "@/lib/types";
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check,
  TrendingUp,
  TrendingDown,
  Droplets,
  Users,
  Clock,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/format";

const queryClient = new QueryClient();

function TokenDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const address = params.address as string;
  const chainId = (searchParams.get("chain") || "56") as ChainId;
  
  const { data, isLoading, error } = useTokenDetail(address, chainId);
  const { data: liquidityData } = useLiquidity(address, chainId);
  
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isLoading) {
    return <TokenDetailSkeleton />;
  }
  
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">代币未找到</h1>
          <p className="text-muted-foreground mb-4">无法加载该代币的数据</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const { token, pools } = data;
  const isPositive = (token.priceChange24h || 0) >= 0;
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b">
        <div className="container py-4">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </div>
      </header>
      
      <main className="container py-6">
        {/* 代币基础信息 */}
        <div className="flex items-start gap-4 mb-8">
          {token.logoUrl ? (
            <img 
              src={token.logoUrl} 
              alt={token.symbol}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {token.symbol.charAt(0)}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{token.symbol}</h1>
              <ChainBadge chainId={token.chainId} />
              {token.isSpotListed && <Badge variant="success">现货已上架</Badge>}
              {token.isFuturesListed && <Badge variant="warning">合约已上架</Badge>}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <code className="bg-muted px-2 py-1 rounded">
                {formatAddress(token.contractAddress, 8)}
              </code>
              <button onClick={handleCopy} className="p-1 hover:bg-muted rounded">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={getTokenExplorerUrl(token.chainId, token.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-muted rounded"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">
              {formatPrice(token.priceUsd)}
            </div>
            <div className={cn(
              "flex items-center justify-end gap-1 text-lg font-mono",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatPriceChange(token.priceChange24h)}
            </div>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="市值"
            value={formatCurrency(token.marketCap, { compact: true })}
          />
          <StatCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="完全稀释估值"
            value={formatCurrency(token.fdv, { compact: true })}
            subValue={token.circulationRate ? `流通率 ${(token.circulationRate * 100).toFixed(1)}%` : undefined}
          />
          <StatCard
            icon={<Droplets className="h-5 w-5" />}
            label="总流动性"
            value={formatCurrency(liquidityData?.totalLiquidity || token.liquidity, { compact: true })}
            subValue={`${pools.length} 个池子`}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="持有者"
            value={formatNumber(token.holders, { compact: true, decimals: 0 })}
          />
        </div>
        
        {/* 流动性池列表 */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">流动性池</h2>
          </div>
          
          <div className="divide-y">
            {pools.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                暂无流动性数据
              </div>
            ) : (
              pools.map((pool, index) => (
                <div key={pool.pairAddress} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pool.dexName}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {token.symbol}/{pool.quoteToken}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatAddress(pool.pairAddress, 8)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <div className="text-sm text-muted-foreground">流动性</div>
                        <div className="font-mono font-medium">
                          {formatCurrency(pool.liquidity, { compact: true })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">价格</div>
                        <div className="font-mono font-medium">
                          ${pool.priceUsd.toFixed(pool.priceUsd < 0.01 ? 8 : 4)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">创建时间</div>
                        <div className="font-medium">
                          {formatTimeAgo(pool.pairCreatedAt)}
                        </div>
                      </div>
                      <a
                        href={pool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          DexScreener
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subValue 
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      {subValue && (
        <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
      )}
    </div>
  );
}

function TokenDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4">
          <Skeleton className="h-5 w-24" />
        </div>
      </header>
      <main className="container py-6">
        <div className="flex items-start gap-4 mb-8">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </main>
    </div>
  );
}

export default function TokenDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TokenDetailContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
