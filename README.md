# defillama-gateway

基于 Cloudflare Workers 的链级 DApp 资源查询网关。

## 定位

这个服务接收一个链参数，拉取 DefiLlama 的 `/protocols` 数据，并返回该链上的全部 DApp 资源列表。它适合作为钱包或前端应用的轻量聚合层，避免客户端直接处理 DefiLlama 的大体积协议列表和链别名兼容逻辑。

## 可行性结论

参考 `gateway/price-feed` 的技术栈，这个需求是可行的：

- 运行时仍然是 Cloudflare Workers
- Web 框架仍然是 Hono
- 主要逻辑是一次上游请求加内存缓存，完全符合 Workers 模式
- 单元测试可以继续用 `app.fetch()` + Vitest 方式覆盖

## 数据来源策略

- 核心数据源：`GET https://api.llama.fi/protocols`
- 过滤条件：协议对象中的 `chains`
- 分类依据：协议对象中的 `category`
- 当前分组：`dex`、`bridge`、`staking`、`game`、`other`

之所以优先使用 `/protocols`，是因为它能覆盖“某条链的全部 DApp 列表”这个目标，而不是只覆盖 DEX 或 Bridge 某一类。

## 快速开始

```bash
npm install
cp .env.example .env
npm run dev
```

本地默认端口由 Wrangler 提供，通常是 `8787`。

## API

### 健康检查

```http
GET /health
```

### OpenAPI 规范

```http
GET /api/v1/openapi.json
```

这个端点用于生成 Flutter SDK 或其他类型的 API Client。

### 查询链上 DApp 列表

```http
GET /api/v1/dapps?chain=ethereum
GET /api/v1/dapps?chain=eth
GET /api/v1/dapps?chain=bnb
GET /api/v1/dapps?chain=eth&group=dex
GET /api/v1/dapps?chain=eth&category=Liquid%20Staking
GET /api/v1/dapps?chain=eth&group=dex&limit=20&offset=0
GET /api/v1/dapps?chain=eth&fields=id,name,category,chainTvl&sort=chainTvl_desc&limit=20&offset=0
GET /api/v1/dapps?chain=eth&fields=id,name,chainTvl&excludeSummary=true&includeTotal=false&limit=20&offset=0
GET /api/v1/dapps?chain=eth&fields=id,name,chainTvl&compact=true&limit=20&offset=0
```

可选筛选参数：

- `group`: `dex`、`bridge`、`staking`、`game`、`other`
- `category`: 按 DefiLlama 原始 `category` 名称过滤，大小写和分隔符不敏感
- `limit`: 返回条数上限，正整数，最大 `500`
- `offset`: 起始偏移，非负整数
- `fields`: 逗号分隔的字段白名单，可选值：`id,name,slug,url,logo,category,group,parentProtocol,chains,chainTvl,tvl`
- `sort`: 排序方式，可选值：`chainTvl_desc`、`chainTvl_asc`、`tvl_desc`、`tvl_asc`、`name_asc`、`name_desc`
- `excludeSummary`: 是否省略 `summary`，可选值：`true`、`false`
- `includeTotal`: 是否返回 `total`，可选值：`true`、`false`
- `compact`: 轻量响应预设。`compact=true` 默认等价于 `excludeSummary=true&includeTotal=false`；显式传入 `excludeSummary` 或 `includeTotal` 时，以显式参数为准

支持一部分常见别名归一化，例如：

- `eth` -> `Ethereum`
- `bnb` / `bsc` -> `BSC`
- `arb` -> `Arbitrum`
- `op` -> `Optimism`
- `sol` -> `Solana`
- `trx` -> `Tron`

响应示例：

```json
{
  "success": true,
  "data": {
    "chain": "Ethereum",
    "requestedChain": "eth",
    "total": 3,
    "pagination": {
      "limit": null,
      "offset": 0,
      "returned": 3
    },
    "summary": {
      "byGroup": {
        "dex": 1,
        "bridge": 1,
        "staking": 1,
        "game": 0,
        "other": 0
      },
      "byCategory": {
        "Dexs": 1,
        "Bridge": 1,
        "Liquid Staking": 1
      }
    },
    "protocols": [
      {
        "id": "1",
        "name": "Lido",
        "slug": "lido",
        "category": "Liquid Staking",
        "group": "staking",
        "chains": ["Ethereum", "Solana"],
        "chainTvl": 5000,
        "tvl": 5030
      }
    ]
  }
}
```

## 配置

通过 `wrangler.toml` 或环境变量配置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DEFILLAMA_BASE_URL` | `https://api.llama.fi` | DefiLlama API 地址 |
| `PROTOCOLS_CACHE_TTL` | `300` | `/protocols` 内存缓存秒数 |
| `REQUEST_TIMEOUT_SECS` | `12` | 上游请求超时秒数 |

## 域名配置

Worker 路由已经在 `wrangler.toml` 中配置为：

```toml
routes = [
  { pattern = "defillama.bithub.pro/*", zone_id = "a2377099496ecf3fe85caa580e64b070" }
]
```

如果要让 `defillama.bithub.pro` 可访问，还需要在 Cloudflare DNS 中补一条记录：

- Type: `CNAME`
- Name: `defillama`
- Target: `defillama-gateway.deng-zz.workers.dev`
- Proxy status: `Proxied`

说明：

- Worker 名称是 `defillama-gateway`
- 对应的 `workers.dev` 主机名是 `defillama-gateway.deng-zz.workers.dev`
- `price-feed` 采用的也是同一模式：自定义域名 CNAME 到对应的 `workers.dev` 主机名
- 如果 DNS 未配置完成，`defillama.bithub.pro` 会返回 `NXDOMAIN`

验证命令：

```bash
nslookup defillama.bithub.pro
curl https://defillama.bithub.pro/health
curl 'https://defillama.bithub.pro/api/v1/dapps?chain=eth'
```

## 命令

```bash
npm run dev
npm test
npm run typecheck
npm run deploy
npm run generate-sdk
```

## Flutter SDK

参考 `gateway/dex-swap`，这个服务现在也支持通过 OpenAPI 自动生成 Flutter SDK。

生成命令：

```bash
npm run generate-sdk
```

默认会从线上 OpenAPI 拉取规范：

```text
https://defillama.bithub.pro/api/v1/openapi.json
```

生成产物目录：

```text
defillama-gateway-flutter/
```

## 目录结构

```text
defillama/
├── src/
│   └── index.ts
├── test/
│   └── gateway.test.ts
├── package.json
├── tsconfig.json
├── wrangler.toml
└── README.md
```