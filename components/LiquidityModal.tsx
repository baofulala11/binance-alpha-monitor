"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AlphaToken } from "@/lib/types";
import { formatCurrency, formatTimeAgo, formatAddress } from "@/lib/utils/format";
import { ExternalLink, Copy, Check } from "lucide-react";

interface PoolInfo {
  dexId: string;
  dexName: string;
  pairAddress: string;
  quoteTokenSymbol: string;
  liquidity: number;
  priceUsd: number;
  pairCreatedAt: number;
  url: string;
  volume24h: number;
  priceChange24h: number;
}

interface LiquidityData {
  pools: PoolInfo[];
  totalLiquidity: number;
  totalVolume24h: number;
}

interface LiquidityModalProps {
  token: AlphaToken | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LiquidityModal({ token, open, onOpenChange }: LiquidityModalProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [data, setData] = useState<LiquidityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 当弹窗打开时获取数据
  useEffect(() => {
    if (open && token) {
      setLoading(true);
      setError(null);
      
      fetch(`/api/liquidity/${token.contractAddress}?chain=${token.chainId}`)
        .then(res => res.json())
        .then(result => {
          if (result.error) {
            setError(result.error);
          } else {
            setData(result);
          }
        })
        .catch(err => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // 关闭时清理数据
      setData(null);
      setError(null);
    }
  }, [open, token]);
  
  if (!token) return null;
  
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };
  
  const pools = data?.pools || [];
  const totalLiquidity = data?.totalLiquidity || 0;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {token.logoUrl && (
              <img src={token.logoUrl} alt={token.symbol} className="w-6 h-6 rounded-full" />
            )}
            {token.symbol} 流动性详情
          </DialogTitle>
          <DialogDescription>
            {loading ? (
              "加载中..."
            ) : (
              `共 ${pools.length} 个流动性池，总流动性 ${formatCurrency(totalLiquidity)}`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-48 mb-3" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-8">
              加载失败: {error}
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              暂无流动性数据
            </div>
          ) : (
            <div className="space-y-3">
              {pools.map((pool, index) => (
                <PoolCard 
                  key={pool.pairAddress} 
                  pool={pool} 
                  index={index}
                  copiedAddress={copiedAddress}
                  onCopy={copyAddress}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PoolCard({ 
  pool, 
  index,
  copiedAddress,
  onCopy 
}: { 
  pool: PoolInfo; 
  index: number;
  copiedAddress: string | null;
  onCopy: (address: string) => void;
}) {
  const isCopied = copiedAddress === pool.pairAddress;
  
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* DEX 和交易对 */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-medium">
              {pool.dexName}
            </Badge>
            <span className="text-sm text-muted-foreground">
              #{index + 1}
            </span>
          </div>
          
          {/* 交易对地址 */}
          <div className="flex items-center gap-2 mb-3">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {formatAddress(pool.pairAddress, 8)}
            </code>
            <button
              onClick={() => onCopy(pool.pairAddress)}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="复制地址"
            >
              {isCopied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            <a
              href={pool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-muted rounded transition-colors"
              title="在 DexScreener 查看"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </a>
          </div>
          
          {/* 数据 */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">流动性</div>
              <div className="font-medium">{formatCurrency(pool.liquidity)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">24h成交</div>
              <div className="font-medium">{formatCurrency(pool.volume24h)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">价格</div>
              <div className="font-medium">${pool.priceUsd.toFixed(pool.priceUsd < 0.01 ? 8 : 4)}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">创建时间</div>
              <div className="font-medium">{formatTimeAgo(pool.pairCreatedAt)}</div>
            </div>
          </div>
        </div>
        
        {/* 配对代币 */}
        <div className="text-right">
          <div className="text-xs text-muted-foreground mb-1">配对</div>
          <Badge variant="secondary">{pool.quoteTokenSymbol}</Badge>
        </div>
      </div>
    </div>
  );
}
