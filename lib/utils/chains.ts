import type { ChainId, ChainInfo } from "@/lib/types";

/**
 * 支持的区块链配置
 */
export const CHAINS: Record<ChainId, ChainInfo> = {
  "56": {
    id: "56",
    name: "BNB Smart Chain",
    shortName: "BSC",
    icon: "/chains/bsc.svg",
    explorerUrl: "https://bscscan.com",
    dexScreenerId: "bsc",
  },
  "1": {
    id: "1",
    name: "Ethereum",
    shortName: "ETH",
    icon: "/chains/ethereum.svg",
    explorerUrl: "https://etherscan.io",
    dexScreenerId: "ethereum",
  },
  "solana": {
    id: "solana",
    name: "Solana",
    shortName: "SOL",
    icon: "/chains/solana.svg",
    explorerUrl: "https://solscan.io",
    dexScreenerId: "solana",
  },
  "8453": {
    id: "8453",
    name: "Base",
    shortName: "BASE",
    icon: "/chains/base.svg",
    explorerUrl: "https://basescan.org",
    dexScreenerId: "base",
  },
  "42161": {
    id: "42161",
    name: "Arbitrum One",
    shortName: "ARB",
    icon: "/chains/arbitrum.svg",
    explorerUrl: "https://arbiscan.io",
    dexScreenerId: "arbitrum",
  },
  "137": {
    id: "137",
    name: "Polygon",
    shortName: "MATIC",
    icon: "/chains/polygon.svg",
    explorerUrl: "https://polygonscan.com",
    dexScreenerId: "polygon",
  },
  "43114": {
    id: "43114",
    name: "Avalanche",
    shortName: "AVAX",
    icon: "/chains/avalanche.svg",
    explorerUrl: "https://snowtrace.io",
    dexScreenerId: "avalanche",
  },
  "10": {
    id: "10",
    name: "Optimism",
    shortName: "OP",
    icon: "/chains/optimism.svg",
    explorerUrl: "https://optimistic.etherscan.io",
    dexScreenerId: "optimism",
  },
  "250": {
    id: "250",
    name: "Fantom",
    shortName: "FTM",
    icon: "/chains/fantom.svg",
    explorerUrl: "https://ftmscan.com",
    dexScreenerId: "fantom",
  },
};

/**
 * 获取链信息
 */
export function getChainInfo(chainId: ChainId): ChainInfo {
  return CHAINS[chainId] || {
    id: chainId,
    name: `Chain ${chainId}`,
    shortName: chainId.substring(0, 4).toUpperCase(),
    icon: "/chains/unknown.svg",
    explorerUrl: "",
    dexScreenerId: chainId,
  };
}

/**
 * 获取区块浏览器链接（代币）
 */
export function getTokenExplorerUrl(chainId: ChainId, address: string): string {
  const chain = getChainInfo(chainId);
  
  if (chainId === "solana") {
    return `${chain.explorerUrl}/token/${address}`;
  }
  
  return `${chain.explorerUrl}/token/${address}`;
}

/**
 * 获取区块浏览器链接（地址）
 */
export function getAddressExplorerUrl(chainId: ChainId, address: string): string {
  const chain = getChainInfo(chainId);
  
  if (chainId === "solana") {
    return `${chain.explorerUrl}/account/${address}`;
  }
  
  return `${chain.explorerUrl}/address/${address}`;
}

/**
 * 获取 DexScreener 代币链接
 */
export function getDexScreenerUrl(chainId: ChainId, address: string): string {
  const chain = getChainInfo(chainId);
  return `https://dexscreener.com/${chain.dexScreenerId}/${address}`;
}

/**
 * 获取 GeckoTerminal 代币链接
 */
export function getGeckoTerminalUrl(chainId: ChainId, address: string): string {
  const networkMap: Record<string, string> = {
    "56": "bsc",
    "1": "eth",
    "solana": "solana",
    "8453": "base",
    "42161": "arbitrum",
    "137": "polygon_pos",
  };
  
  const network = networkMap[chainId] || chainId;
  return `https://www.geckoterminal.com/${network}/tokens/${address}`;
}

/**
 * 获取支持的链列表
 */
export function getSupportedChains(): ChainInfo[] {
  return Object.values(CHAINS);
}

/**
 * 链列表（用于筛选下拉框）
 */
export const CHAIN_LIST = Object.values(CHAINS);

/**
 * 检查是否是 EVM 链
 */
export function isEvmChain(chainId: ChainId): boolean {
  return chainId !== "solana";
}

/**
 * 获取链的原生代币符号
 */
export function getNativeTokenSymbol(chainId: ChainId): string {
  const symbolMap: Record<string, string> = {
    "56": "BNB",
    "1": "ETH",
    "solana": "SOL",
    "8453": "ETH",
    "42161": "ETH",
    "137": "MATIC",
    "43114": "AVAX",
    "10": "ETH",
    "250": "FTM",
  };
  
  return symbolMap[chainId] || "ETH";
}

/**
 * 链颜色配置（用于UI展示）
 */
export const CHAIN_COLORS: Record<string, string> = {
  "56": "#F0B90B",      // BSC 黄色
  "1": "#627EEA",       // Ethereum 蓝色
  "solana": "#9945FF",  // Solana 紫色
  "8453": "#0052FF",    // Base 蓝色
  "42161": "#28A0F0",   // Arbitrum 蓝色
  "137": "#8247E5",     // Polygon 紫色
  "43114": "#E84142",   // Avalanche 红色
  "10": "#FF0420",      // Optimism 红色
  "250": "#1969FF",     // Fantom 蓝色
};

/**
 * 获取链颜色
 */
export function getChainColor(chainId: ChainId): string {
  return CHAIN_COLORS[chainId] || "#6B7280";
}
