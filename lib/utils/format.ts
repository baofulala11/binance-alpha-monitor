import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind CSS 类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 格式化数字（带单位 K, M, B, T）
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    decimals?: number;
    prefix?: string;
    suffix?: string;
    compact?: boolean;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  
  const { decimals = 2, prefix = "", suffix = "", compact = true } = options;
  
  if (compact && Math.abs(value) >= 1000) {
    const units = ["", "K", "M", "B", "T"];
    let unitIndex = 0;
    let scaledValue = value;
    
    while (Math.abs(scaledValue) >= 1000 && unitIndex < units.length - 1) {
      scaledValue /= 1000;
      unitIndex++;
    }
    
    return `${prefix}${scaledValue.toFixed(decimals)}${units[unitIndex]}${suffix}`;
  }
  
  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

/**
 * 格式化货币
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    decimals?: number;
    compact?: boolean;
  } = {}
): string {
  return formatNumber(value, { ...options, prefix: "$" });
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  
  const percent = value * 100;
  const formatted = percent.toFixed(decimals);
  const sign = percent > 0 ? "+" : "";
  
  return `${sign}${formatted}%`;
}

/**
 * 格式化价格变化百分比
 */
export function formatPriceChange(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  
  const formatted = value.toFixed(2);
  const sign = value > 0 ? "+" : "";
  
  return `${sign}${formatted}%`;
}

/**
 * 格式化价格（智能小数位）
 */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-";
  }
  
  if (value === 0) return "$0";
  
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  
  if (value >= 0.0001) {
    return `$${value.toFixed(4)}`;
  }
  
  if (value >= 0.00000001) {
    return `$${value.toFixed(8)}`;
  }
  
  // 使用科学记数法处理极小值
  return `$${value.toExponential(2)}`;
}

/**
 * 格式化地址（缩短显示）
 */
export function formatAddress(
  address: string | null | undefined,
  length: number = 4
): string {
  if (!address) return "-";
  if (address.length <= length * 2 + 3) return address;
  
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * 格式化时间（相对时间）
 */
export function formatTimeAgo(timestamp: number | null | undefined): string {
  if (!timestamp) return "-";
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
}

/**
 * 格式化日期
 */
export function formatDate(
  timestamp: number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  if (!timestamp) return "-";
  
  return new Date(timestamp).toLocaleString("zh-CN", options);
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 降级方案
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * 延迟执行
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 分批处理数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * 按键分组
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}
