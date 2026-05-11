import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CHAIN_ALIASES } from './chain-aliases';
import { CHAIN_ID_MAP } from './generated/chain-ids';

export interface Env {
  DEFILLAMA_BASE_URL: string;
  PROTOCOLS_CACHE_TTL: string;
  REQUEST_TIMEOUT_SECS: string;
}

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

type DappGroup = 'dex' | 'bridge' | 'staking' | 'game' | 'other';

interface DefiLlamaProtocol {
  id?: string | number;
  name: string;
  slug?: string;
  url?: string;
  logo?: string;
  category?: string;
  parentProtocol?: string;
  chains?: string[];
  chainTvls?: Record<string, unknown>;
  tvl?: number;
}

interface DappResource {
  id: string;
  name: string;
  slug?: string;
  url?: string;
  logo?: string;
  category: string;
  group: DappGroup;
  parentProtocol?: string;
  chains: string[];
  chainTvl: number | null;
  tvl: number | null;
}

type DappField = keyof DappResource;
type DappSort = 'chainTvl_desc' | 'chainTvl_asc' | 'tvl_desc' | 'tvl_asc' | 'name_asc' | 'name_desc';
type DappResponseItem = Partial<DappResource>;

interface DappListResponse {
  success: true;
  data: {
    chain: string;
    requestedChain: string;
    total?: number;
    pagination: {
      limit: number | null;
      offset: number;
      returned: number;
    };
    summary?: {
      byGroup: Record<DappGroup, number>;
      byCategory: Record<string, number>;
    };
    protocols: DappResponseItem[];
  };
}

interface DappFilters {
  group?: DappGroup;
  category?: string;
}

interface DappPagination {
  limit: number | null;
  offset: number;
}

interface DappProjection {
  fields: DappField[] | null;
}

interface DappOptions {
  sort: DappSort;
  projection: DappProjection;
  includeTotal: boolean;
  excludeSummary: boolean;
}

interface CacheEntry {
  data: DefiLlamaProtocol[];
  expiresAt: number;
}
let protocolsCache: CacheEntry | undefined;

const DEFAULT_SORT: DappSort = 'chainTvl_desc';
const VALID_FIELDS: DappField[] = ['id', 'name', 'slug', 'url', 'logo', 'category', 'group', 'parentProtocol', 'chains', 'chainTvl', 'tvl'];
const VALID_SORTS: DappSort[] = ['chainTvl_desc', 'chainTvl_asc', 'tvl_desc', 'tvl_asc', 'name_asc', 'name_desc'];
const VALID_GROUPS: DappGroup[] = ['dex', 'bridge', 'staking', 'game', 'other'];

export function resetCache(): void {
  protocolsCache = undefined;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveCanonicalChain(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return trimmed;
  }

  // Check chain ID first (numeric input)
  if (/^\d+$/.test(trimmed)) {
    const chainId = CHAIN_ID_MAP[trimmed];
    if (chainId) {
      return chainId;
    }
  }

  const alias = CHAIN_ALIASES[normalizeKey(trimmed)];
  if (alias) {
    return alias;
  }
  if (trimmed === trimmed.toUpperCase()) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function chainMatches(protocolChains: string[] | undefined, chain: string): boolean {
  if (!protocolChains || protocolChains.length === 0) {
    return false;
  }
  const target = normalizeKey(chain);
  return protocolChains.some((item) => normalizeKey(item) === target);
}

function parseNumericTvl(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const tvl = record.tvl;
    if (typeof tvl === 'number' && Number.isFinite(tvl)) {
      return tvl;
    }
  }
  return null;
}

function extractChainTvl(protocol: DefiLlamaProtocol, chain: string): number | null {
  if (!protocol.chainTvls) {
    return null;
  }

  const target = normalizeKey(chain);
  let total = 0;
  let matched = false;

  for (const [key, value] of Object.entries(protocol.chainTvls)) {
    const chainKey = key.split('-')[0];
    if (normalizeKey(chainKey) !== target) {
      continue;
    }
    const parsed = parseNumericTvl(value);
    if (parsed === null) {
      continue;
    }
    total += parsed;
    matched = true;
  }

  return matched ? total : null;
}

function getGroupFromCategory(category: string | undefined): DappGroup {
  const normalized = normalizeKey(category ?? '');
  if (normalized.includes('dex')) {
    return 'dex';
  }
  if (normalized.includes('bridge')) {
    return 'bridge';
  }
  if (normalized.includes('staking') || normalized.includes('restaking')) {
    return 'staking';
  }
  if (normalized.includes('game') || normalized.includes('gaming')) {
    return 'game';
  }
  return 'other';
}

function parseFilters(group: string | undefined, category: string | undefined): DappFilters | ApiErrorResponse {
  const filters: DappFilters = {};

  if (group) {
    const normalizedGroup = group.trim().toLowerCase();
    if (!VALID_GROUPS.includes(normalizedGroup as DappGroup)) {
      return {
        success: false,
        error: `Invalid group parameter '${group}'. Expected one of: ${VALID_GROUPS.join(', ')}`,
      };
    }
    filters.group = normalizedGroup as DappGroup;
  }

  if (category?.trim()) {
    filters.category = category.trim();
  }

  return filters;
}

function parseStrictInteger(value: string): number | null {
  const normalized = value.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parsePositiveSeconds(value: string | undefined, fallbackSeconds: number): number {
  if (!value?.trim()) {
    return fallbackSeconds;
  }

  const parsed = parseStrictInteger(value);
  return parsed && parsed > 0 ? parsed : fallbackSeconds;
}

function parsePagination(limit: string | undefined, offset: string | undefined): DappPagination | ApiErrorResponse {
  const pagination: DappPagination = {
    limit: null,
    offset: 0,
  };

  if (limit?.trim()) {
    const parsedLimit = parseStrictInteger(limit);
    if (parsedLimit === null || parsedLimit <= 0) {
      return {
        success: false,
        error: `Invalid limit parameter '${limit}'. Expected a positive integer`,
      };
    }
    if (parsedLimit > 500) {
      return {
        success: false,
        error: `Invalid limit parameter '${limit}'. Maximum supported limit is 500`,
      };
    }
    pagination.limit = parsedLimit;
  }

  if (offset?.trim()) {
    const parsedOffset = parseStrictInteger(offset);
    if (parsedOffset === null || parsedOffset < 0) {
      return {
        success: false,
        error: `Invalid offset parameter '${offset}'. Expected a non-negative integer`,
      };
    }
    pagination.offset = parsedOffset;
  }

  return pagination;
}

function parseProjection(fields: string | undefined): DappProjection | ApiErrorResponse {
  if (!fields?.trim()) {
    return { fields: null };
  }

  const requestedFields = fields
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean);

  if (requestedFields.length === 0) {
    return { fields: null };
  }

  const invalidField = requestedFields.find((field) => !VALID_FIELDS.includes(field as DappField));
  if (invalidField) {
    return {
      success: false,
      error: `Invalid fields parameter '${invalidField}'. Expected a comma-separated subset of: ${VALID_FIELDS.join(', ')}`,
    };
  }

  return { fields: requestedFields as DappField[] };
}

function parseSort(sort: string | undefined): DappSort | ApiErrorResponse {
  if (!sort?.trim()) {
    return DEFAULT_SORT;
  }

  const normalizedSort = sort.trim() as DappSort;
  if (!VALID_SORTS.includes(normalizedSort)) {
    return {
      success: false,
      error: `Invalid sort parameter '${sort}'. Expected one of: ${VALID_SORTS.join(', ')}`,
    };
  }

  return normalizedSort;
}

function parseBooleanFlag(value: string | undefined, flagName: string, defaultValue: boolean): boolean | ApiErrorResponse {
  if (!value?.trim()) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }

  return {
    success: false,
    error: `Invalid ${flagName} parameter '${value}'. Expected true or false`,
  };
}

function compareNumeric(left: number | null, right: number | null, direction: 'asc' | 'desc'): number {
  const leftValue = left ?? -1;
  const rightValue = right ?? -1;
  return direction === 'asc' ? leftValue - rightValue : rightValue - leftValue;
}

function sortProtocols(items: DappResource[], sort: DappSort): DappResource[] {
  return [...items].sort((left, right) => {
    switch (sort) {
      case 'chainTvl_asc': {
        const result = compareNumeric(left.chainTvl ?? left.tvl, right.chainTvl ?? right.tvl, 'asc');
        return result !== 0 ? result : left.name.localeCompare(right.name);
      }
      case 'chainTvl_desc': {
        const result = compareNumeric(left.chainTvl ?? left.tvl, right.chainTvl ?? right.tvl, 'desc');
        return result !== 0 ? result : left.name.localeCompare(right.name);
      }
      case 'tvl_asc': {
        const result = compareNumeric(left.tvl, right.tvl, 'asc');
        return result !== 0 ? result : left.name.localeCompare(right.name);
      }
      case 'tvl_desc': {
        const result = compareNumeric(left.tvl, right.tvl, 'desc');
        return result !== 0 ? result : left.name.localeCompare(right.name);
      }
      case 'name_desc':
        return right.name.localeCompare(left.name);
      case 'name_asc':
      default:
        return left.name.localeCompare(right.name);
    }
  });
}

function projectProtocol(protocol: DappResource, projection: DappProjection): DappResponseItem {
  if (!projection.fields) {
    return protocol;
  }

  const projected: DappResponseItem = {};
  const assignable = projected as Record<DappField, DappResource[DappField] | undefined>;

  for (const field of projection.fields) {
    assignable[field] = protocol[field];
  }

  return projected;
}

function timeoutSignal(secs: string): AbortSignal {
  return AbortSignal.timeout(parsePositiveSeconds(secs, 12) * 1000);
}

async function fetchProtocols(env: Env): Promise<DefiLlamaProtocol[]> {
  if (protocolsCache && Date.now() < protocolsCache.expiresAt) {
    return protocolsCache.data;
  }

  const baseUrl = env.DEFILLAMA_BASE_URL || 'https://api.llama.fi';
  const response = await fetch(`${baseUrl}/protocols`, {
    signal: timeoutSignal(env.REQUEST_TIMEOUT_SECS),
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`DefiLlama API error ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as DefiLlamaProtocol[];
  const ttl = parsePositiveSeconds(env.PROTOCOLS_CACHE_TTL, 300) * 1000;

  protocolsCache = {
    data,
    expiresAt: Date.now() + ttl,
  };

  return data;
}

function buildResponse(
  protocols: DefiLlamaProtocol[],
  requestedChain: string,
  canonicalChain: string,
  filters: DappFilters,
  pagination: DappPagination,
  options: DappOptions,
): DappListResponse {
  const byGroup: Record<DappGroup, number> = {
    dex: 0,
    bridge: 0,
    staking: 0,
    game: 0,
    other: 0,
  };
  const byCategory: Record<string, number> = {};

  const items: DappResource[] = protocols
    .filter((protocol) => chainMatches(protocol.chains, canonicalChain))
    .map((protocol) => {
      const category = protocol.category ?? 'Unknown';
      const group = getGroupFromCategory(category);

      return {
        id: String(protocol.id ?? protocol.slug ?? protocol.name),
        name: protocol.name,
        slug: protocol.slug,
        url: protocol.url,
        logo: protocol.logo,
        category,
        group,
        parentProtocol: protocol.parentProtocol,
        chains: protocol.chains ?? [],
        chainTvl: extractChainTvl(protocol, canonicalChain),
        tvl: typeof protocol.tvl === 'number' ? protocol.tvl : null,
      };
    })
    .filter((protocol) => {
      if (filters.group && protocol.group !== filters.group) {
        return false;
      }
      if (filters.category && normalizeKey(protocol.category) !== normalizeKey(filters.category)) {
        return false;
      }
      return true;
    })
    .map((protocol) => {
      byGroup[protocol.group] += 1;
      byCategory[protocol.category] = (byCategory[protocol.category] ?? 0) + 1;
      return protocol;
    });

  const sortedItems = sortProtocols(items, options.sort);

  const protocolsPage = pagination.limit === null
    ? sortedItems.slice(pagination.offset)
    : sortedItems.slice(pagination.offset, pagination.offset + pagination.limit);
  const projectedProtocols = protocolsPage.map((protocol) => projectProtocol(protocol, options.projection));

  return {
    success: true,
    data: {
      chain: canonicalChain,
      requestedChain,
      ...(options.includeTotal ? { total: items.length } : {}),
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset,
        returned: protocolsPage.length,
      },
      ...(!options.excludeSummary ? {
        summary: {
          byGroup,
          byCategory,
        },
      } : {}),
      protocols: projectedProtocols,
    },
  };
}

function openapiSpec() {
  return {
    openapi: '3.0.3',
    info: {
      title: 'ZeroWallet DefiLlama Gateway',
      description: 'Chain-to-DApp query gateway backed by DefiLlama protocols data.',
      version: '1.0.0',
    },
    servers: [
      { url: 'https://defillama.bithub.pro', description: 'Production' },
      { url: 'https://defillama-gateway.deng-zz.workers.dev', description: 'Workers.dev' },
      { url: 'http://localhost:8787', description: 'Local dev' },
    ],
    paths: {
      '/health': {
        get: {
          operationId: 'getHealth',
          summary: '健康检查',
          tags: ['System'],
          responses: {
            '200': {
              description: '服务正常',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/HealthResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/dapps': {
        get: {
          operationId: 'listDapps',
          summary: '按链查询 DApp 列表',
          description: '从 DefiLlama /protocols 拉取数据，按链过滤，并支持 group/category/fields/sort/pagination 等参数。',
          tags: ['DApps'],
          parameters: [
            { name: 'chain', in: 'query', required: true, schema: { type: 'string' }, description: '链名称或常见别名，如 eth/bnb/arb' },
            { name: 'group', in: 'query', required: false, schema: { type: 'string', enum: VALID_GROUPS }, description: 'DApp 分组过滤' },
            { name: 'category', in: 'query', required: false, schema: { type: 'string' }, description: '按 DefiLlama category 过滤' },
            { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 1, maximum: 500 } },
            { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
            { name: 'fields', in: 'query', required: false, schema: { type: 'string' }, description: `逗号分隔字段白名单: ${VALID_FIELDS.join(', ')}` },
            { name: 'sort', in: 'query', required: false, schema: { type: 'string', enum: VALID_SORTS } },
            { name: 'excludeSummary', in: 'query', required: false, schema: { type: 'boolean' } },
            { name: 'includeTotal', in: 'query', required: false, schema: { type: 'boolean' } },
            { name: 'compact', in: 'query', required: false, schema: { type: 'boolean' }, description: '轻量响应预设，等价于 excludeSummary=true & includeTotal=false' },
          ],
          responses: {
            '200': {
              description: '链上 DApp 列表',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DappListResponse' },
                },
              },
            },
            '400': {
              description: '请求参数错误',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorResponse' },
                },
              },
            },
            '502': {
              description: '上游错误',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        HealthResponse: {
          type: 'object',
          required: ['status', 'service', 'timestamp', 'version'],
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: { type: 'boolean', enum: [false] },
            error: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          required: ['limit', 'offset', 'returned'],
          properties: {
            limit: { type: 'integer', nullable: true },
            offset: { type: 'integer' },
            returned: { type: 'integer' },
          },
        },
        Summary: {
          type: 'object',
          required: ['byGroup', 'byCategory'],
          properties: {
            byGroup: {
              type: 'object',
              additionalProperties: { type: 'integer' },
            },
            byCategory: {
              type: 'object',
              additionalProperties: { type: 'integer' },
            },
          },
        },
        DappResource: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string', nullable: true },
            url: { type: 'string', nullable: true },
            logo: { type: 'string', nullable: true },
            category: { type: 'string' },
            group: { type: 'string', enum: VALID_GROUPS },
            parentProtocol: { type: 'string', nullable: true },
            chains: { type: 'array', items: { type: 'string' } },
            chainTvl: { type: 'number', nullable: true },
            tvl: { type: 'number', nullable: true },
          },
        },
        DappListResponse: {
          type: 'object',
          required: ['success', 'data'],
          properties: {
            success: { type: 'boolean', enum: [true] },
            data: {
              type: 'object',
              required: ['chain', 'requestedChain', 'pagination', 'protocols'],
              properties: {
                chain: { type: 'string' },
                requestedChain: { type: 'string' },
                total: { type: 'integer' },
                pagination: { $ref: '#/components/schemas/Pagination' },
                summary: { $ref: '#/components/schemas/Summary' },
                protocols: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DappResource' },
                },
              },
            },
          },
        },
      },
    },
  };
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'defillama-gateway',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  } satisfies HealthResponse);
});

app.get('/api/v1/openapi.json', (c) => {
  return c.json(openapiSpec());
});

app.get('/docs', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DefiLlama Gateway API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.5/swagger-ui.css" integrity="sha384-9Q2fpS+xeS4ffJy6CagnwoUl+4ldAYhOs9pgZuEKxypVModhmZFzeMlvVsAjf7uT" crossorigin="anonymous" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.32.5/swagger-ui-bundle.js" integrity="sha384-ACi6p1pgYLrDqBMp9QGYWrvcHVJ6XBash5d/uHImhNJ6AJKuQ3qzvkNIZ64Y+RVt" crossorigin="anonymous"></script>
  <script>
    SwaggerUIBundle({ url: '/api/v1/openapi.json', dom_id: '#swagger-ui' });
  </script>
</body>
</html>`);
});

app.get('/api/v1/dapps', async (c) => {
  const requestedChain = c.req.query('chain')?.trim();
  if (!requestedChain) {
    return c.json({
      success: false,
      error: 'Missing chain parameter',
    } satisfies ApiErrorResponse, 400);
  }

  const canonicalChain = resolveCanonicalChain(requestedChain);
  const parsedFilters = parseFilters(c.req.query('group'), c.req.query('category'));
  if ('error' in parsedFilters) {
    return c.json(parsedFilters satisfies ApiErrorResponse, 400);
  }
  const parsedPagination = parsePagination(c.req.query('limit'), c.req.query('offset'));
  if ('error' in parsedPagination) {
    return c.json(parsedPagination satisfies ApiErrorResponse, 400);
  }
  const parsedProjection = parseProjection(c.req.query('fields'));
  if ('error' in parsedProjection) {
    return c.json(parsedProjection satisfies ApiErrorResponse, 400);
  }
  const parsedSort = parseSort(c.req.query('sort'));
  if (typeof parsedSort !== 'string') {
    return c.json(parsedSort satisfies ApiErrorResponse, 400);
  }
  const compact = parseBooleanFlag(c.req.query('compact'), 'compact', false);
  if (typeof compact !== 'boolean') {
    return c.json(compact satisfies ApiErrorResponse, 400);
  }
  const includeTotalDefault = compact ? false : true;
  const excludeSummaryDefault = compact ? true : false;
  const includeTotal = parseBooleanFlag(c.req.query('includeTotal'), 'includeTotal', includeTotalDefault);
  if (typeof includeTotal !== 'boolean') {
    return c.json(includeTotal satisfies ApiErrorResponse, 400);
  }
  const excludeSummary = parseBooleanFlag(c.req.query('excludeSummary'), 'excludeSummary', excludeSummaryDefault);
  if (typeof excludeSummary !== 'boolean') {
    return c.json(excludeSummary satisfies ApiErrorResponse, 400);
  }

  try {
    const protocols = await fetchProtocols(c.env);
    return c.json(buildResponse(protocols, requestedChain, canonicalChain, parsedFilters, parsedPagination, {
      sort: parsedSort,
      projection: parsedProjection,
      includeTotal,
      excludeSummary,
    }));
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    } satisfies ApiErrorResponse, 502);
  }
});

export default app;