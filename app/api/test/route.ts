/**
 * 测试 API - 检查 Binance API 连接
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: Binance Alpha API
  try {
    const response = await fetch(
      "https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list",
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      }
    );
    
    const text = await response.text();
    results.tests = {
      ...results.tests as object,
      binanceAlpha: {
        status: response.status,
        ok: response.ok,
        dataLength: text.length,
        preview: text.substring(0, 200),
      }
    };
  } catch (error) {
    results.tests = {
      ...results.tests as object,
      binanceAlpha: {
        error: String(error),
      }
    };
  }

  // Test 2: Binance Spot API (usually works globally)
  try {
    const response = await fetch("https://api.binance.com/api/v3/ping");
    results.tests = {
      ...results.tests as object,
      binanceSpot: {
        status: response.status,
        ok: response.ok,
      }
    };
  } catch (error) {
    results.tests = {
      ...results.tests as object,
      binanceSpot: {
        error: String(error),
      }
    };
  }

  return NextResponse.json(results);
}
