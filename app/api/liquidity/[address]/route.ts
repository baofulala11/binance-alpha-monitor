/**
 * 流动性详情 API
 */

import { NextResponse } from "next/server";
import { fetchTokenPairs } from "@/lib/api/dexscreener";
import type { DexScreenerPair } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 30;

interface ExtendedPoolInfo {
  dexId: string;
  dexName: string;
  pairAddress: string;
  quoteTokenSymbol: string;
  liquidity: number;
  priceUsd: number;
  pairCreatedAt: number;
  url: string;
  volume24h: number;
  txns24h: { buys: number; sells: number };
  priceChange24h: number;
  baseToken: { address: string; symbol: string; name: string };
  quoteToken: { address: string; symbol: string; name: string };
}

function buildPoolInfo(pair: DexScreenerPair): ExtendedPoolInfo {
  return {
    dexId: pair.dexId,
    dexName: getDexName(pair.dexId),
    pairAddress: pair.pairAddress,
    quoteTokenSymbol: pair.quoteToken.symbol,
    liquidity: pair.liquidity?.usd || 0,
    priceUsd: parseFloat(pair.priceUsd) || 0,
    pairCreatedAt: pair.pairCreatedAt || 0,
    url: pair.url,
    volume24h: pair.volume?.h24 || 0,
    txns24h: pair.txns?.h24 || { buys: 0, sells: 0 },
    priceChange24h: pair.priceChange?.h24 || 0,
    baseToken: {
      address: pair.baseToken.address,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
    },
    quoteToken: {
      address: pair.quoteToken.address,
      symbol: pair.quoteToken.symbol,
      name: pair.quoteToken.name,
    },
  };
}

function getDexName(dexId: string): string {
  const names: Record<string, string> = {
    "pancakeswap": "PancakeSwap",
    "uniswap": "Uniswap",
    "raydium": "Raydium",
    "orca": "Orca",
    "sushiswap": "SushiSwap",
    "quickswap": "QuickSwap",
    "trader_joe": "Trader Joe",
    "aerodrome": "Aerodrome",
    "camelot": "Camelot",
    "meteora": "Meteora",
    "jupiter": "Jupiter",
  };
  
  return names[dexId.toLowerCase()] || dexId.charAt(0).toUpperCase() + dexId.slice(1);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chain") || "56";
    
    const pairs = await fetchTokenPairs(chainId, address);
    
    if (!pairs.length) {
      return NextResponse.json({
        pools: [],
        totalLiquidity: 0,
        totalVolume24h: 0,
      });
    }
    
    // 构建池信息并按流动性排序
    const pools = pairs
      .map(buildPoolInfo)
      .sort((a, b) => b.liquidity - a.liquidity);
    
    // 计算汇总数据
    const totalLiquidity = pools.reduce((sum, p) => sum + p.liquidity, 0);
    const totalVolume24h = pools.reduce((sum, p) => sum + p.volume24h, 0);
    
    // 获取主要DEX分布
    const dexDistribution = pools.reduce((acc, pool) => {
      const key = pool.dexId;
      if (!acc[key]) {
        acc[key] = { dexId: key, dexName: pool.dexName, liquidity: 0, poolCount: 0 };
      }
      acc[key].liquidity += pool.liquidity;
      acc[key].poolCount += 1;
      return acc;
    }, {} as Record<string, { dexId: string; dexName: string; liquidity: number; poolCount: number }>);
    
    return NextResponse.json({
      pools,
      totalLiquidity,
      totalVolume24h,
      dexDistribution: Object.values(dexDistribution).sort((a, b) => b.liquidity - a.liquidity),
      lastUpdated: Date.now(),
    });
    
  } catch (error) {
    console.error("Liquidity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch liquidity data" },
      { status: 500 }
    );
  }
}
