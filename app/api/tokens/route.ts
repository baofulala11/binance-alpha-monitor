/**
 * 代币列表 API
 * 聚合多个数据源，返回完整的代币信息
 */

import { NextResponse } from "next/server";
import { 
  fetchAlphaTokenList,
  getSpotListedSymbols,
  getFuturesListedSymbols,
} from "@/lib/api/binance-alpha";
import { 
  fetchTokensData,
  getBestPair,
  getTokenLogo,
} from "@/lib/api/dexscreener";
import type { AlphaToken, LiquidityPoolInfo, DexScreenerPair } from "@/lib/types";
import { groupBy, chunk } from "@/lib/utils/format";
import { getDexScreenerUrl, getTokenExplorerUrl } from "@/lib/utils/chains";

export const dynamic = "force-dynamic";
export const revalidate = 30; // 30秒重新验证

/**
 * 从 DexScreener 数据构建 LP 信息
 */
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

/**
 * 处理单个链的代币数据
 */
async function processChainTokens(
  chainId: string,
  tokens: Array<{ contractAddress: string; symbol: string; name: string; alphaId: number }>
): Promise<Map<string, { pairs: DexScreenerPair[]; logo?: string }>> {
  const result = new Map<string, { pairs: DexScreenerPair[]; logo?: string }>();
  
  // 按30个一批处理（DexScreener 限制）
  const batches = chunk(tokens, 30);
  
  for (const batch of batches) {
    const addresses = batch.map(t => t.contractAddress);
    
    try {
      const pairs = await fetchTokensData(chainId, addresses);
      
      // 按代币地址分组
      for (const token of batch) {
        const tokenPairs = pairs.filter(
          p => p.baseToken.address.toLowerCase() === token.contractAddress.toLowerCase()
        );
        
        result.set(token.contractAddress.toLowerCase(), {
          pairs: tokenPairs,
          logo: getTokenLogo(tokenPairs),
        });
      }
    } catch (error) {
      console.error(`Error fetching chain ${chainId} tokens:`, error);
    }
  }
  
  return result;
}

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
      getSpotListedSymbols(),
      getFuturesListedSymbols(),
    ]);
    
    // 2. 按链分组
    const tokensByChain = groupBy(alphaTokens, (t) => t.chainId);
    
    // 3. 并行处理每条链的代币
    const chainResults = await Promise.all(
      Object.entries(tokensByChain).map(async ([chainId, tokens]) => {
        const dexData = await processChainTokens(chainId, tokens);
        return { chainId, tokens, dexData };
      })
    );
    
    // 4. 聚合所有数据
    const enrichedTokens: AlphaToken[] = [];
    
    for (const { chainId, tokens, dexData } of chainResults) {
      for (const token of tokens) {
        const data = dexData.get(token.contractAddress.toLowerCase());
        const bestPair = data?.pairs ? getBestPair(data.pairs) : null;
        
        // 计算流通率
        const marketCap = bestPair?.marketCap || null;
        const fdv = bestPair?.fdv || null;
        const circulationRate = marketCap && fdv ? marketCap / fdv : null;
        
        // 构建所有 LP 信息
        const allPools: LiquidityPoolInfo[] = (data?.pairs || []).map(buildPoolInfo);
        
        const enrichedToken: AlphaToken = {
          // 基础信息
          alphaId: token.alphaId,
          symbol: token.symbol,
          name: token.name,
          chainId: chainId,
          contractAddress: token.contractAddress,
          logoUrl: data?.logo || bestPair?.info?.imageUrl,
          
          // 市场数据
          priceUsd: bestPair ? parseFloat(bestPair.priceUsd) : null,
          marketCap: marketCap,
          fdv: fdv,
          liquidity: bestPair?.liquidity?.usd || null,
          volume24h: bestPair?.volume?.h24 || null,
          priceChange24h: bestPair?.priceChange?.h24 || null,
          
          // 计算字段
          circulationRate,
          
          // 持有者（需要 Birdeye/Moralis，此处为 null）
          holders: null,
          
          // LP 信息
          mainPool: bestPair ? buildPoolInfo(bestPair) : null,
          allPools,
          
          // 上架状态
          isSpotListed: spotSymbols.has(token.symbol.toUpperCase()),
          isFuturesListed: futuresSymbols.has(token.symbol.toUpperCase()),
          
          // 时间
          listingTime: bestPair?.pairCreatedAt || null,
          
          // 链接
          dexScreenerUrl: getDexScreenerUrl(chainId, token.contractAddress),
          explorerUrl: getTokenExplorerUrl(chainId, token.contractAddress),
        };
        
        enrichedTokens.push(enrichedToken);
      }
    }
    
    // 5. 应用筛选
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
    
    // 6. 排序
    filteredTokens.sort((a, b) => {
      const aValue = a[sortBy as keyof AlphaToken];
      const bValue = b[sortBy as keyof AlphaToken];
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
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
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
