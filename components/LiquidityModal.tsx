"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { AlphaToken, LiquidityPoolInfo } from "@/lib/types";
import { formatCurrency, formatTimeAgo, formatAddress } from "@/lib/utils/format";
import { ExternalLink, Copy, Check } from "lucide-react";

interface LiquidityModalProps {
  token: AlphaToken | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LiquidityModal({ token, open, onOpenChange }: LiquidityModalProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  if (!token) return null;
  
  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };
  
  const pools = token.allPools || [];
  const totalLiquidity = pools.reduce((sum, p) => sum + p.liquidity, 0);
  
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
            共 {pools.length} 个流动性池，总流动性 {formatCurrency(totalLiquidity)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {pools.length === 0 ? (
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
  pool: LiquidityPoolInfo; 
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
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">流动性</div>
              <div className="font-medium">{formatCurrency(pool.liquidity)}</div>
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
          <Badge variant="secondary">{pool.quoteToken}</Badge>
        </div>
      </div>
    </div>
  );
}
