import { NextResponse } from 'next/server';

const API_ROOT =
  process.env.API_PROXY_TARGET?.replace(/\/$/, '') ?? 'http://localhost:8085';

async function fetchCatalogToken(): Promise<string | null> {
  const identifier = process.env.CATALOG_SERVICE_EMAIL?.trim();
  const password = process.env.CATALOG_SERVICE_PASSWORD?.trim();
  if (!identifier || !password) {
    return null;
  }

  const loginRes = await fetch(`${API_ROOT}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, email: identifier, password }),
    cache: 'no-store',
  });

  if (!loginRes.ok) return null;
  const loginJson = (await loginRes.json()) as { data?: { accessToken?: string } };
  return loginJson.data?.accessToken ?? null;
}

/** Server-only catalog proxy — marketing pages cannot call /products without JWT. */
export async function GET() {
  try {
    const token = await fetchCatalogToken();
    if (!token) {
      return NextResponse.json({ content: [], totalElements: 0 });
    }

    const productsRes = await fetch(`${API_ROOT}/api/v1/products?page=0&size=12`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });

    if (!productsRes.ok) {
      return NextResponse.json({ content: [], totalElements: 0 });
    }

    const productsJson = (await productsRes.json()) as {
      data?: { content?: unknown[]; totalElements?: number };
      content?: unknown[];
      totalElements?: number;
    };
    const payload = productsJson.data ?? productsJson;

    return NextResponse.json({
      content: payload.content ?? [],
      totalElements: payload.totalElements ?? payload.content?.length ?? 0,
    });
  } catch {
    return NextResponse.json({ content: [], totalElements: 0 });
  }
}
