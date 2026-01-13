"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChainBadge } from "@/components/ChainBadge";
import { getSupportedChains } from "@/lib/utils/chains";
import type { ChainId } from "@/lib/types";
import { cn } from "@/lib/utils/format";
import { Filter, X } from "lucide-react";

interface ChainFilterProps {
  selectedChain: ChainId | null;
  onChainChange: (chain: ChainId | null) => void;
  tokenCounts?: Record<string, number>;
}

export function ChainFilter({ 
  selectedChain, 
  onChainChange,
  tokenCounts = {},
}: ChainFilterProps) {
  const chains = getSupportedChains();
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <div className="flex items-center gap-1 text-sm text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        <span>链:</span>
      </div>
      
      <Button
        variant={selectedChain === null ? "default" : "outline"}
        size="sm"
        onClick={() => onChainChange(null)}
        className="shrink-0"
      >
        全部
        {Object.keys(tokenCounts).length > 0 && (
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {Object.values(tokenCounts).reduce((a, b) => a + b, 0)}
          </Badge>
        )}
      </Button>
      
      {chains.map((chain) => {
        const count = tokenCounts[chain.id] || 0;
        const isSelected = selectedChain === chain.id;
        
        return (
          <Button
            key={chain.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChainChange(isSelected ? null : chain.id)}
            className={cn("shrink-0 gap-1.5", count === 0 && "opacity-50")}
          >
            <ChainBadge chainId={chain.id} showName={false} size="sm" />
            {chain.shortName}
            {count > 0 && (
              <Badge 
                variant={isSelected ? "outline" : "secondary"} 
                className="text-[10px]"
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
      
      {selectedChain && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChainChange(null)}
          className="shrink-0"
        >
          <X className="h-3 w-3 mr-1" />
          清除筛选
        </Button>
      )}
    </div>
  );
}
