# Binance Alpha Monitor

实时监控币安 Alpha 板块代币信息的仪表板，包括市值、流动性、持有者、上架状态等数据。

![Screenshot](./screenshot.png)

## 功能特性

- ✅ **代币列表** - 显示所有币安 Alpha 代币
- ✅ **多链支持** - 支持 BSC、ETH、Solana、Base、Arbitrum 等多条链
- ✅ **实时数据** - 价格、市值、FDV、流动性等实时更新
- ✅ **流通率** - 自动计算市值/FDV 流通率
- ✅ **流动性详情** - 点击查看所有 LP 池及详细信息
- ✅ **上架状态** - 显示是否已上架币安现货/合约
- ✅ **链筛选** - 按区块链筛选代币
- ✅ **搜索** - 支持代币名称、符号、地址搜索
- ✅ **排序** - 支持按各字段排序
- ✅ **自动刷新** - 数据每30秒自动刷新

## 技术栈

- **框架**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **状态管理**: TanStack Query (React Query)
- **表格**: TanStack Table
- **语言**: TypeScript

## 数据源

| 数据 | 来源 |
|------|------|
| 代币列表 | Binance Alpha API |
| 价格、市值、FDV、流动性 | DexScreener API |
| 价格（备选） | GeckoTerminal API |
| 持有者数据 | Birdeye API / Moralis API |
| 现货/合约上架状态 | Binance API |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/binance-alpha-monitor.git
cd binance-alpha-monitor
```

### 2. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 3. 配置环境变量（可选）

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 添加 API Key：

```env
# 可选：用于获取持有者数据
BIRDEYE_API_KEY=your_birdeye_api_key
MORALIS_API_KEY=your_moralis_api_key
```

> **注意**: 基础功能无需 API Key，币安 Alpha 和 DexScreener API 都是公开的。API Key 仅用于获取持有者数据。

### 4. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/binance-alpha-monitor)

1. 点击上方按钮
2. 连接你的 GitHub 账号
3. 配置环境变量（可选）
4. 部署！

## 项目结构

```
binance-alpha-monitor/
├── app/
│   ├── api/
│   │   ├── tokens/route.ts          # 代币列表 API
│   │   ├── token/[address]/route.ts # 代币详情 API
│   │   └── liquidity/[address]/route.ts
│   ├── token/[address]/page.tsx     # 代币详情页
│   ├── page.tsx                      # 首页
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui 组件
│   ├── TokenTable.tsx                # 代币表格
│   ├── ChainBadge.tsx               # 链标识
│   ├── ChainFilter.tsx              # 链筛选
│   ├── LiquidityModal.tsx           # 流动性弹窗
│   └── Header.tsx                    # 顶部导航
├── hooks/
│   ├── useTokens.ts                  # 代币列表 Hook
│   └── useTokenDetail.ts             # 代币详情 Hook
├── lib/
│   ├── api/
│   │   ├── binance-alpha.ts          # 币安 Alpha API
│   │   ├── dexscreener.ts           # DexScreener API
│   │   ├── gecko-terminal.ts        # GeckoTerminal API
│   │   ├── birdeye.ts               # Birdeye API
│   │   └── moralis.ts               # Moralis API
│   ├── utils/
│   │   ├── format.ts                 # 格式化工具
│   │   └── chains.ts                 # 链配置
│   └── types.ts                      # 类型定义
└── public/
    └── favicon.svg
```

## API 端点

### GET /api/tokens

获取代币列表。

**查询参数:**
- `chain` - 按链筛选 (如 "56", "solana")
- `search` - 搜索关键词
- `sortBy` - 排序字段
- `sortOrder` - 排序方向 ("asc" | "desc")

**响应示例:**
```json
{
  "tokens": [...],
  "totalCount": 150,
  "lastUpdated": 1704067200000
}
```

### GET /api/token/[address]

获取单个代币详情。

**查询参数:**
- `chain` - 链 ID

### GET /api/liquidity/[address]

获取代币流动性详情。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 致谢

- [Binance Alpha](https://www.binance.com/zh-CN/alpha)
- [DexScreener](https://dexscreener.com/)
- [GeckoTerminal](https://www.geckoterminal.com/)
- [shadcn/ui](https://ui.shadcn.com/)
