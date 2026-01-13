import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Binance Alpha Monitor - 实时追踪币安Alpha代币",
  description: "监控币安Alpha板块代币信息，包括市值、流动性、持有者、上架状态等实时数据",
  keywords: ["Binance", "Alpha", "加密货币", "代币", "监控", "DeFi"],
  authors: [{ name: "Binance Alpha Monitor" }],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
