"use client";

import { getChainInfo, getChainColor } from "@/lib/utils/chains";
import type { ChainId } from "@/lib/types";
import { cn } from "@/lib/utils/format";

interface ChainBadgeProps {
  chainId: ChainId;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChainBadge({ 
  chainId, 
  showName = true, 
  size = "md",
  className 
}: ChainBadgeProps) {
  const chain = getChainInfo(chainId);
  const color = getChainColor(chainId);
  
  const sizeClasses = {
    sm: "h-4 w-4 text-[10px]",
    md: "h-5 w-5 text-xs",
    lg: "h-6 w-6 text-sm",
  };
  
  const paddingClasses = {
    sm: "px-1.5 py-0.5 gap-1",
    md: "px-2 py-1 gap-1.5",
    lg: "px-2.5 py-1.5 gap-2",
  };
  
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        paddingClasses[size],
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {/* Chain Icon */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold",
          sizeClasses[size]
        )}
        style={{ backgroundColor: color, color: "#fff" }}
      >
        {chain.shortName.charAt(0)}
      </div>
      
      {showName && (
        <span className={cn(
          size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs"
        )}>
          {chain.shortName}
        </span>
      )}
    </div>
  );
}

/** 简单的链图标 */
export function ChainIcon({ chainId, size = "md" }: { chainId: ChainId; size?: "sm" | "md" | "lg" }) {
  const chain = getChainInfo(chainId);
  const color = getChainColor(chainId);
  
  const sizeClasses = {
    sm: "h-4 w-4 text-[8px]",
    md: "h-5 w-5 text-[10px]",
    lg: "h-6 w-6 text-xs",
  };
  
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold",
        sizeClasses[size]
      )}
      style={{ backgroundColor: color, color: "#fff" }}
      title={chain.name}
    >
      {chain.shortName.charAt(0)}
    </div>
  );
}
