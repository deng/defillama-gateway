import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

async function createApp() {
  const mod = await import('../src/index');
  return mod.default;
}

async function resetCache() {
  const mod = await import('../src/index');
  mod.resetCache?.();
}

const mockEnv = {
  DEFILLAMA_BASE_URL: 'https://api.llama.fi',
  PROTOCOLS_CACHE_TTL: '300',
  REQUEST_TIMEOUT_SECS: '12',
};

function mockRequest(method: string, url: string): Request {
  return new Request(url, { method });
}

function protocolsMockResponse(): Response {
  return new Response(JSON.stringify([
    {
      id: '1',
      name: 'Lido',
      slug: 'lido',
      category: 'Liquid Staking',
      chains: ['Ethereum', 'Solana'],
      chainTvls: { Ethereum: 5000, Solana: 30 },
      tvl: 5030,
    },
    {
      id: '2',
      name: 'Uniswap',
      slug: 'uniswap',
      category: 'Dexs',
      chains: ['Ethereum', 'Arbitrum'],
      chainTvls: { Ethereum: 1200, Arbitrum: 150 },
      tvl: 1350,
    },
    {
      id: '3',
      name: 'Hop Protocol',
      slug: 'hop-protocol',
      category: 'Bridge',
      chains: ['Ethereum', 'Optimism'],
      chainTvls: { Ethereum: 400, Optimism: 80 },
      tvl: 480,
    },
    {
      id: '4',
      name: 'Pixels',
      slug: 'pixels',
      category: 'Gaming',
      chains: ['Ronin'],
      chainTvls: { Ronin: 40 },
      tvl: 40,
    },
    {
      id: '5',
      name: 'PancakeSwap',
      slug: 'pancakeswap',
      category: 'Dexs',
      chains: ['BSC'],
      chainTvls: { BSC: 700 },
      tvl: 700,
    },
  ]), { status: 200 });
}

beforeEach(async () => {
  await resetCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/health'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.status).toBe('healthy');
    expect(body.service).toBe('defillama-gateway');
    expect(body.version).toBe('0.1.0');
  });
});

describe('GET /api/v1/openapi.json', () => {
  it('returns an OpenAPI spec', async () => {
    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/openapi.json'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.openapi).toBe('3.0.3');
    expect(body.info.title).toContain('DefiLlama');
    expect(body.paths['/api/v1/dapps']).toBeDefined();
  });
});

describe('GET /api/v1/dapps', () => {
  it('validates missing chain', async () => {
    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps'), mockEnv);

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('chain');
  });

  it('filters protocols by canonical chain and groups categories', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.chain).toBe('Ethereum');
    expect(body.data.total).toBe(3);
    expect(body.data.summary.byGroup.staking).toBe(1);
    expect(body.data.summary.byGroup.dex).toBe(1);
    expect(body.data.summary.byGroup.bridge).toBe(1);
    expect(body.data.protocols.map((item: any) => item.name)).toEqual([
      'Lido',
      'Uniswap',
      'Hop Protocol',
    ]);
    expect(body.data.protocols[0].chainTvl).toBe(5000);
  });

  it('supports BSC aliases', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=bnb'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.chain).toBe('BSC');
    expect(body.data.total).toBe(1);
    expect(body.data.protocols[0].name).toBe('PancakeSwap');
  });

  it('resolves chain ID 1 to Ethereum', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=1'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.chain).toBe('Ethereum');
    expect(body.data.total).toBe(3);
  });

  it('resolves chain ID 56 to BSC', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=56'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.chain).toBe('BSC');
    expect(body.data.total).toBe(1);
    expect(body.data.protocols[0].name).toBe('PancakeSwap');
  });

  it('filters by group', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&group=dex'), mockEnv);

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBe(1);
    expect(body.data.summary.byGroup.dex).toBe(1);
    expect(body.data.summary.byGroup.bridge).toBe(0);
    expect(body.data.protocols.map((item: any) => item.name)).toEqual(['Uniswap']);
  });

  it('filters by category case-insensitively', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&category=liquid-staking'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBe(1);
    expect(body.data.summary.byCategory).toEqual({ 'Liquid Staking': 1 });
    expect(body.data.protocols[0].name).toBe('Lido');
  });

  it('supports limit and offset pagination', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&limit=1&offset=1'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBe(3);
    expect(body.data.pagination).toEqual({ limit: 1, offset: 1, returned: 1 });
    expect(body.data.protocols.map((item: any) => item.name)).toEqual(['Uniswap']);
  });

  it('supports field projection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&fields=id,name,category'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.protocols[0]).toEqual({
      id: '1',
      name: 'Lido',
      category: 'Liquid Staking',
    });
  });

  it('supports explicit sort order', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&sort=name_desc'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.protocols.map((item: any) => item.name)).toEqual([
      'Uniswap',
      'Lido',
      'Hop Protocol',
    ]);
  });

  it('supports excluding summary from the response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&excludeSummary=true'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.summary).toBeUndefined();
    expect(body.data.total).toBe(3);
  });

  it('supports excluding total from the response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&includeTotal=false'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBeUndefined();
    expect(body.data.summary.byGroup.dex).toBe(1);
  });

  it('supports compact preset', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&compact=true'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBeUndefined();
    expect(body.data.summary).toBeUndefined();
    expect(body.data.pagination.returned).toBe(3);
  });

  it('allows explicit flags to override compact preset', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());

    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&compact=true&includeTotal=true&excludeSummary=false'),
      mockEnv,
    );

    expect(response.status).toBe(200);
    const body: any = await response.json();
    expect(body.data.total).toBe(3);
    expect(body.data.summary.byGroup.dex).toBe(1);
  });

  it('validates invalid pagination filters', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&limit=0'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid limit');
  });

  it('rejects non-integer pagination values', async () => {
    const app = await createApp();

    const limitResponse = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&limit=1.5'),
      mockEnv,
    );
    expect(limitResponse.status).toBe(400);

    const offsetResponse = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&offset=1e2'),
      mockEnv,
    );
    expect(offsetResponse.status).toBe(400);
  });

  it('validates invalid fields filters', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&fields=id,name,invalidField'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid fields');
  });

  it('validates invalid sort filters', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&sort=invalid_sort'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid sort');
  });

  it('validates invalid boolean flags', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&excludeSummary=maybe'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid excludeSummary');
  });

  it('validates invalid compact flag', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&compact=maybe'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid compact');
  });

  it('validates invalid group filters', async () => {
    const app = await createApp();
    const response = await app.fetch(
      mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth&group=invalid'),
      mockEnv,
    );

    expect(response.status).toBe(400);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Invalid group');
  });

  it('returns upstream errors as 502', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }));

    const app = await createApp();
    const response = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth'), mockEnv);

    expect(response.status).toBe(502);
    const body: any = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('DefiLlama API error 500');
  });

  it('falls back to default timeout and cache ttl when env values are invalid', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(protocolsMockResponse());
    const app = await createApp();
    const invalidEnv = {
      ...mockEnv,
      REQUEST_TIMEOUT_SECS: 'abc',
      PROTOCOLS_CACHE_TTL: 'xyz',
    };

    const firstResponse = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth'), invalidEnv);
    const secondResponse = await app.fetch(mockRequest('GET', 'http://localhost/api/v1/dapps?chain=eth'), invalidEnv);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});