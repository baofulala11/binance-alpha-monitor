"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChainBadge } from "@/components/ChainBadge";
import { LiquidityModal } from "@/components/LiquidityModal";
import type { AlphaToken } from "@/lib/types";
import { 
  formatCurrency, 
  formatPrice, 
  formatPriceChange, 
  formatPercent, 
  formatNumber,
  formatAddress,
  formatTimeAgo,
  copyToClipboard,
} from "@/lib/utils/format";
import { 
  ArrowUpDown, 
  ExternalLink, 
  Copy, 
  Check,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils/format";

interface TokenTableProps {
  tokens: AlphaToken[];
  isLoading?: boolean;
  onSort?: (key: keyof AlphaToken) => void;
  sortBy?: keyof AlphaToken;
  sortOrder?: "asc" | "desc";
}

export function TokenTable({ 
  tokens, 
  isLoading, 
  onSort,
  sortBy,
  sortOrder,
}: TokenTableProps) {
  const [selectedToken, setSelectedToken] = useState<AlphaToken | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  
  const handleCopy = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };
  
  const handleLiquidityClick = (token: AlphaToken) => {
    setSelectedToken(token);
    setModalOpen(true);
  };
  
  const SortableHeader = ({ 
    children, 
    sortKey,
    className,
  }: { 
    children: React.ReactNode; 
    sortKey: keyof AlphaToken;
    className?: string;
  }) => (
    <TableHead 
      className={cn("cursor-pointer hover:bg-muted/50 transition-colors", className)}
      onClick={() => onSort?.(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3",
          sortBy === sortKey ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
    </TableHead>
  );
  
  if (isLoading) {
    return <TokenTableSkeleton />;
  }
  
  if (!tokens.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无代币数据
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <SortableHeader sortKey="symbol" className="min-w-[180px]">代币</SortableHeader>
            <TableHead>链</TableHead>
            <SortableHeader sortKey="priceUsd">价格</SortableHeader>
            <SortableHeader sortKey="priceChange24h">24h</SortableHeader>
            <SortableHeader sortKey="marketCap">市值</SortableHeader>
            <SortableHeader sortKey="fdv">FDV</SortableHeader>
            <SortableHeader sortKey="circulationRate">流通率</SortableHeader>
            <SortableHeader sortKey="liquidity">流动性</SortableHeader>
            <SortableHeader sortKey="holders">持有者</SortableHeader>
            <TableHead>上架状态</TableHead>
            <SortableHeader sortKey="listingTime">上市时间</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token, index) => (
            <TableRow key={`${token.chainId}-${token.contractAddress}`}>
              {/* 序号 */}
              <TableCell className="text-muted-foreground">
                {index + 1}
              </TableCell>
              
              {/* 代币信息 */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {token.logoUrl ? (
                    <img 
                      src={token.logoUrl} 
                      alt={token.symbol} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="truncate max-w-[80px]">
                        {formatAddress(token.contractAddress)}
                      </span>
                      <button
                        onClick={() => handleCopy(token.contractAddress)}
                        className="p-0.5 hover:bg-muted rounded"
                      >
                        {copiedAddress === token.contractAddress ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </TableCell>
              
              {/* 链 */}
              <TableCell>
                <ChainBadge chainId={token.chainId} size="sm" />
              </TableCell>
              
              {/* 价格 */}
              <TableCell className="font-mono">
                {formatPrice(token.priceUsd)}
              </TableCell>
              
              {/* 24h变化 */}
              <TableCell>
                <PriceChange value={token.priceChange24h} />
              </TableCell>
              
              {/* 市值 */}
              <TableCell className="font-mono">
                {formatCurrency(token.marketCap, { compact: true })}
              </TableCell>
              
              {/* FDV */}
              <TableCell className="font-mono">
                {formatCurrency(token.fdv, { compact: true })}
              </TableCell>
              
              {/* 流通率 */}
              <TableCell>
                {token.circulationRate !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(token.circulationRate * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(token.circulationRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              
              {/* 流动性 */}
              <TableCell>
                <button
                  onClick={() => handleLiquidityClick(token)}
                  className="font-mono hover:text-primary hover:underline transition-colors"
                >
                  {formatCurrency(token.liquidity, { compact: true })}
                </button>
              </TableCell>
              
              {/* 持有者 */}
              <TableCell className="font-mono">
                {formatNumber(token.holders, { compact: true, decimals: 0 })}
              </TableCell>
              
              {/* 上架状态 */}
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {token.isSpotListed && (
                    <Badge variant="success" className="text-[10px]">现货</Badge>
                  )}
                  {token.isFuturesListed && (
                    <Badge variant="warning" className="text-[10px]">合约</Badge>
                  )}
                  {!token.isSpotListed && !token.isFuturesListed && (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </div>
              </TableCell>
              
              {/* 上市时间 */}
              <TableCell className="text-xs text-muted-foreground">
                {formatTimeAgo(token.listingTime)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <LiquidityModal
        token={selectedToken}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

function PriceChange({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  const isPositive = value >= 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 font-mono",
      isPositive ? "text-green-500" : "text-red-500"
    )}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {formatPriceChange(value)}
    </div>
  );
}

function TokenTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
