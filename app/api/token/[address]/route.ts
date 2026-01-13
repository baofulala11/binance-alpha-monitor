/**
 * 单个代币详情 API
 */

import { NextResponse } from "next/server";
import { fetchTokenPairs } from "@/lib/api/dexscreener";
import { fetchTokenMarketData, fetchHolderStats } from "@/lib/api/birdeye";
import { fetchTokenHolderCount } from "@/lib/api/moralis";
import type { AlphaToken, LiquidityPoolInfo, DexScreenerPair } from "@/lib/types";
import { getDexScreenerUrl, getTokenExplorerUrl } from "@/lib/utils/chains";

export const dynamic = "force-dynamic";
export const revalidate = 30;

function buildPoolInfo(pair: DexScreenerPair): LiquidityPoolInfo {
  return {
    dexId: pair.dexId,
    dexName: pair.dexId.charAt(0).toUpperCase() + pair.dexId.slice(1),
    pairAddress: pair.pairAddress,
    quoteToken: pair.quoteToken.symbol,
    liquidity: pair.liquidity?.usd || 0,
    priceUsd: parseFloat(pair.priceUsd) || 0,
    pairCreatedAt: pair.pairCreatedAt || 0,
    url: pair.url,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chain") || "56";
    
    // 并行获取数据
    const [pairs, birdeyeData, holderCount] = await Promise.all([
      fetchTokenPairs(chainId, address),
      fetchTokenMarketData(chainId, address).catch(() => null),
      fetchTokenHolderCount(chainId, address).catch(() => null),
    ]);
    
    if (!pairs.length && !birdeyeData) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }
    
    // 获取最佳交易对
    const bestPair = pairs.length > 0
      ? pairs.reduce((best, current) => {
          const bestLiq = best.liquidity?.usd || 0;
          const currentLiq = current.liquidity?.usd || 0;
          return currentLiq > bestLiq ? current : best;
        }, pairs[0])
      : null;
    
    // 构建代币数据
    const marketCap = birdeyeData?.marketCap || bestPair?.marketCap || null;
    const fdv = birdeyeData?.fdv || bestPair?.fdv || null;
    
    const token: AlphaToken = {
      alphaId: "",
      symbol: bestPair?.baseToken.symbol || "",
      name: bestPair?.baseToken.name || "",
      chainId,
      contractAddress: address,
      logoUrl: bestPair?.info?.imageUrl,
      
      priceUsd: birdeyeData?.price || (bestPair ? parseFloat(bestPair.priceUsd) : null),
      marketCap,
      fdv,
      liquidity: birdeyeData?.liquidity || bestPair?.liquidity?.usd || null,
      volume24h: birdeyeData?.volume24h || bestPair?.volume?.h24 || null,
      priceChange24h: birdeyeData?.priceChange24h || bestPair?.priceChange?.h24 || null,
      
      circulationRate: marketCap && fdv ? marketCap / fdv : null,
      
      holders: birdeyeData?.holders || holderCount || null,
      
      mainPool: bestPair ? buildPoolInfo(bestPair) : null,
      allPools: pairs.map(buildPoolInfo),
      
      isSpotListed: false,
      isFuturesListed: false,
      
      listingTime: bestPair?.pairCreatedAt || null,
      
      dexScreenerUrl: getDexScreenerUrl(chainId, address),
      explorerUrl: getTokenExplorerUrl(chainId, address),
    };
    
    // 获取持有者详情（如果配置了 Birdeye）
    let holderStats = null;
    try {
      holderStats = await fetchHolderStats(chainId, address);
    } catch {
      // 忽略错误
    }
    
    return NextResponse.json({
      token,
      pools: pairs.map(buildPoolInfo),
      holderStats,
      lastUpdated: Date.now(),
    });
    
  } catch (error) {
    console.error("Token detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token details" },
      { status: 500 }
    );
  }
}
