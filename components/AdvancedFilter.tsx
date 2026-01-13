"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { CHAIN_LIST } from "@/lib/utils/chains";

export interface FilterConditions {
  chainId: string;
  spotStatus: "all" | "listed" | "not_listed";
  futuresStatus: "all" | "listed" | "not_listed";
  minMarketCap: string;
  maxMarketCap: string;
  minLiquidity: string;
  maxLiquidity: string;
  startDate: string;
  endDate: string;
}

const defaultFilters: FilterConditions = {
  chainId: "all",
  spotStatus: "all",
  futuresStatus: "all",
  minMarketCap: "",
  maxMarketCap: "",
  minLiquidity: "",
  maxLiquidity: "",
  startDate: "",
  endDate: "",
};

interface AdvancedFilterProps {
  filters: FilterConditions;
  onFiltersChange: (filters: FilterConditions) => void;
}

export function AdvancedFilter({ filters, onFiltersChange }: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterConditions>(filters);

  // 计算激活的筛选条件数量
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "chainId") return value !== "all";
    if (key === "spotStatus") return value !== "all";
    if (key === "futuresStatus") return value !== "all";
    return value !== "";
  }).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const updateFilter = <K extends keyof FilterConditions>(
    key: K,
    value: FilterConditions[K]
  ) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          高级筛选
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">高级筛选</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              重置
            </Button>
          </div>

          {/* 区块链 */}
          <div className="space-y-2">
            <Label className="text-xs">区块链</Label>
            <Select
              value={localFilters.chainId}
              onValueChange={(value) => updateFilter("chainId", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="全部链" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部链</SelectItem>
                {CHAIN_LIST.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 现货状态 */}
          <div className="space-y-2">
            <Label className="text-xs">现货状态</Label>
            <Select
              value={localFilters.spotStatus}
              onValueChange={(value) => updateFilter("spotStatus", value as FilterConditions["spotStatus"])}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="listed">已上架</SelectItem>
                <SelectItem value="not_listed">未上架</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 合约状态 */}
          <div className="space-y-2">
            <Label className="text-xs">合约状态</Label>
            <Select
              value={localFilters.futuresStatus}
              onValueChange={(value) => updateFilter("futuresStatus", value as FilterConditions["futuresStatus"])}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="listed">已上架</SelectItem>
                <SelectItem value="not_listed">未上架</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 市值区间 */}
          <div className="space-y-2">
            <Label className="text-xs">市值区间 (USD)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最小值"
                value={localFilters.minMarketCap}
                onChange={(e) => updateFilter("minMarketCap", e.target.value)}
                className="h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="最大值"
                value={localFilters.maxMarketCap}
                onChange={(e) => updateFilter("maxMarketCap", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* 流动性区间 */}
          <div className="space-y-2">
            <Label className="text-xs">流动性区间 (USD)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="最小值"
                value={localFilters.minLiquidity}
                onChange={(e) => updateFilter("minLiquidity", e.target.value)}
                className="h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="最大值"
                value={localFilters.maxLiquidity}
                onChange={(e) => updateFilter("maxLiquidity", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* 上市时间 */}
          <div className="space-y-2">
            <Label className="text-xs">上市时间</Label>
            <div className="space-y-2">
              <Input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                className="h-9"
              />
              <div className="text-center text-xs text-muted-foreground">至</div>
              <Input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button size="sm" onClick={handleApply} className="flex-1">
              应用筛选
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 筛选逻辑
export function applyFilters(
  tokens: Array<{
    chainId: string;
    isSpotListed: boolean;
    isFuturesListed: boolean;
    marketCap: number | null;
    liquidity: number | null;
    listingTime: number | null;
  }>,
  filters: FilterConditions
) {
  return tokens.filter((token) => {
    // 链筛选
    if (filters.chainId !== "all" && token.chainId !== filters.chainId) {
      return false;
    }

    // 现货状态
    if (filters.spotStatus === "listed" && !token.isSpotListed) {
      return false;
    }
    if (filters.spotStatus === "not_listed" && token.isSpotListed) {
      return false;
    }

    // 合约状态
    if (filters.futuresStatus === "listed" && !token.isFuturesListed) {
      return false;
    }
    if (filters.futuresStatus === "not_listed" && token.isFuturesListed) {
      return false;
    }

    // 市值区间
    if (filters.minMarketCap) {
      const min = parseFloat(filters.minMarketCap);
      if (token.marketCap === null || token.marketCap < min) {
        return false;
      }
    }
    if (filters.maxMarketCap) {
      const max = parseFloat(filters.maxMarketCap);
      if (token.marketCap === null || token.marketCap > max) {
        return false;
      }
    }

    // 流动性区间
    if (filters.minLiquidity) {
      const min = parseFloat(filters.minLiquidity);
      if (token.liquidity === null || token.liquidity < min) {
        return false;
      }
    }
    if (filters.maxLiquidity) {
      const max = parseFloat(filters.maxLiquidity);
      if (token.liquidity === null || token.liquidity > max) {
        return false;
      }
    }

    // 上市时间
    if (filters.startDate && token.listingTime) {
      const startTs = new Date(filters.startDate).getTime();
      if (token.listingTime < startTs) {
        return false;
      }
    }
    if (filters.endDate && token.listingTime) {
      const endTs = new Date(filters.endDate).getTime() + 86400000; // 包含当天
      if (token.listingTime > endTs) {
        return false;
      }
    }

    return true;
  });
}

export const defaultFilterConditions = defaultFilters;
