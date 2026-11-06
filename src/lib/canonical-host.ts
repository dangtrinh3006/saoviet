/**
 * Target URL when a request arrives on a non-canonical host, else null.
 * One host keeps session cookies and OAuth callbacks on a single origin.
 */
export function canonicalUrl(url: URL, canonicalHost: string | undefined): string | null {
  if (!canonicalHost || url.host === canonicalHost) return null;
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return null;
  return `https://${canonicalHost}${url.pathname}${url.search}`;
}
