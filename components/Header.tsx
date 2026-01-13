"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/format";

interface HeaderProps {
  lastUpdated?: number;
  tokenCount?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function Header({
  lastUpdated,
  tokenCount,
  isRefreshing,
  onRefresh,
  searchValue = "",
  onSearchChange,
}: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            α
          </div>
          <span className="hidden sm:inline">Binance Alpha Monitor</span>
        </Link>
        
        {/* 搜索框 */}
        <div className={cn(
          "flex-1 max-w-md transition-all",
          isSearchFocused && "max-w-lg"
        )}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索代币名称、符号或地址..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full h-9 rounded-md border border-input bg-background px-9 py-2 text-sm",
                "ring-offset-background placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          {tokenCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline">{tokenCount}</Badge>
              <span>代币</span>
            </div>
          )}
          
          {lastUpdated && (
            <div className="text-xs">
              更新于 {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn(
              "h-4 w-4",
              isRefreshing && "animate-spin"
            )} />
            <span className="hidden sm:inline ml-1">刷新</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
