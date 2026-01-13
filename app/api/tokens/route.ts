/**
 * 代币列表 API
 * 直接使用币安 Alpha API 返回的数据（已包含价格、市值等信息）
 */

import { NextResponse } from "next/server";
import { 
  fetchAlphaTokenList,
  getSpotListedSymbols,
  getFuturesListedSymbols,
} from "@/lib/api/binance-alpha";
import type { AlphaToken } from "@/lib/types";
import { getDexScreenerUrl, getTokenExplorerUrl } from "@/lib/utils/chains";

export const dynamic = "force-dynamic";
export const revalidate = 30; // 30秒重新验证

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainFilter = searchParams.get("chain");
    const search = searchParams.get("search")?.toLowerCase();
    const sortBy = searchParams.get("sortBy") || "marketCap";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // 1. 并行获取所有基础数据
    const [alphaTokens, spotSymbols, futuresSymbols] = await Promise.all([
      fetchAlphaTokenList(),
      getSpotListedSymbols().catch(() => new Set<string>()),
      getFuturesListedSymbols().catch(() => new Set<string>()),
    ]);
    
    // 2. 转换为前端需要的格式
    const enrichedTokens: AlphaToken[] = alphaTokens.map((token) => {
      const price = parseFloat(token.price) || null;
      const marketCap = parseFloat(token.marketCap) || null;
      const fdv = parseFloat(token.fdv) || null;
      const liquidity = parseFloat(token.liquidity) || null;
      const volume24h = parseFloat(token.volume24h) || null;
      const priceChange24h = parseFloat(token.percentChange24h) || null;
      const holders = parseInt(token.holders) || null;
      
      // 计算流通率
      const circulationRate = marketCap && fdv && fdv > 0 ? marketCap / fdv : null;
      
      return {
        // 基础信息
        alphaId: token.alphaId,
        symbol: token.symbol,
        name: token.name,
        chainId: token.chainId,
        chainName: token.chainName,
        contractAddress: token.contractAddress,
        logoUrl: token.iconUrl,
        
        // 市场数据（直接从 Binance API 获取）
        priceUsd: price,
        marketCap: marketCap,
        fdv: fdv,
        liquidity: liquidity,
        volume24h: volume24h,
        priceChange24h: priceChange24h,
        
        // 计算字段
        circulationRate,
        
        // 持有者数据
        holders: holders,
        
        // LP 信息（简化）
        mainPool: null,
        allPools: [],
        
        // 上架状态
        isSpotListed: token.listingCex || spotSymbols.has(token.symbol.toUpperCase()),
        isFuturesListed: futuresSymbols.has(token.symbol.toUpperCase()),
        
        // 时间
        listingTime: token.listingTime || null,
        
        // 链接
        dexScreenerUrl: getDexScreenerUrl(token.chainId, token.contractAddress),
        explorerUrl: getTokenExplorerUrl(token.chainId, token.contractAddress),
      };
    });
    
    // 3. 应用筛选
    let filteredTokens = enrichedTokens;
    
    if (chainFilter) {
      filteredTokens = filteredTokens.filter(t => t.chainId === chainFilter);
    }
    
    if (search) {
      filteredTokens = filteredTokens.filter(t => 
        t.symbol.toLowerCase().includes(search) ||
        t.name.toLowerCase().includes(search) ||
        t.contractAddress.toLowerCase().includes(search)
      );
    }
    
    // 4. 排序
    filteredTokens.sort((a, b) => {
      const aValue = a[sortBy as keyof AlphaToken];
      const bValue = b[sortBy as keyof AlphaToken];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "desc" 
          ? bValue.localeCompare(aValue)
          : aValue.localeCompare(bValue);
      }
      
      return 0;
    });
    
    return NextResponse.json({
      tokens: filteredTokens,
      lastUpdated: Date.now(),
      totalCount: filteredTokens.length,
    });
    
  } catch (error) {
    console.error("Token list API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens", details: String(error) },
      { status: 500 }
    );
  }
}
