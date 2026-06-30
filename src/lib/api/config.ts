/** Browser-facing API base URL (axios). Use `/api/v1` on Vercel with `API_PROXY_TARGET`. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';
}
