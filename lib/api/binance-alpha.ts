/**
 * 币安 Alpha API 封装
 * 文档: https://developers.binance.com/docs/alpha/market-data/rest-api/token-list
 */

import type { BinanceAlphaToken, BinanceAlphaResponse, BinanceExchangeInfo } from "@/lib/types";

const BINANCE_ALPHA_BASE_URL = "https://www.binance.com/bapi/defi/v1/public";
const BINANCE_API_BASE_URL = "https://api.binance.com";
const BINANCE_FUTURES_BASE_URL = "https://fapi.binance.com";

/**
 * 获取所有币安 Alpha 代币列表
 */
export async function fetchAlphaTokenList(): Promise<BinanceAlphaToken[]> {
  const url = `${BINANCE_ALPHA_BASE_URL}/wallet-direct/buw/wallet/cex/alpha/all/token/list`;
  
  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    next: { revalidate: 60 }, // 缓存60秒
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch alpha tokens: ${response.status}`);
  }
  
  const data: BinanceAlphaResponse = await response.json();
  
  if (data.code !== "000000") {
    throw new Error(`Binance Alpha API error: ${data.message}`);
  }
  
  return data.data;
}

/**
 * 获取币安现货交易对信息
 */
export async function fetchSpotExchangeInfo(): Promise<BinanceExchangeInfo> {
  const url = `${BINANCE_API_BASE_URL}/api/v3/exchangeInfo`;
  
  const response = await fetch(url, {
    next: { revalidate: 300 }, // 缓存5分钟
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch spot exchange info: ${response.status}`);
  }
  
  return response.json();
}

/**
 * 获取币安合约交易对信息
 */
export async function fetchFuturesExchangeInfo(): Promise<BinanceExchangeInfo> {
  const url = `${BINANCE_FUTURES_BASE_URL}/fapi/v1/exchangeInfo`;
  
  const response = await fetch(url, {
    next: { revalidate: 300 }, // 缓存5分钟
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch futures exchange info: ${response.status}`);
  }
  
  return response.json();
}

/**
 * 获取现货已上架的代币符号集合
 */
export async function getSpotListedSymbols(): Promise<Set<string>> {
  const info = await fetchSpotExchangeInfo();
  return new Set(info.symbols.map(s => s.baseAsset.toUpperCase()));
}

/**
 * 获取合约已上架的代币符号集合
 */
export async function getFuturesListedSymbols(): Promise<Set<string>> {
  const info = await fetchFuturesExchangeInfo();
  return new Set(info.symbols.map(s => s.baseAsset.toUpperCase()));
}

/**
 * 获取 Alpha 代币的24小时行情
 */
export async function fetchAlphaTicker24h(symbol: string): Promise<{
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
}> {
  const url = `${BINANCE_ALPHA_BASE_URL}/alpha-trade/ticker/24hr?symbol=${symbol}`;
  
  const response = await fetch(url, {
    next: { revalidate: 30 }, // 缓存30秒
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ticker: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
}

/**
 * 获取 Alpha 代币的K线数据
 */
export async function fetchAlphaKlines(
  symbol: string,
  interval: string = "1h",
  limit: number = 100
): Promise<Array<{
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}>> {
  const url = `${BINANCE_ALPHA_BASE_URL}/alpha-trade/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  
  const response = await fetch(url, {
    next: { revalidate: 60 }, // 缓存1分钟
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch klines: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data;
}
