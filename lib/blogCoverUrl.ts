import { getApiOrigin } from "@/lib/apiOrigin";

/** Turn API `cover_url` (absolute or `/media/...`) into a browser-loadable image URL. */
export function resolveBlogCoverUrl(coverUrl: string | null | undefined): string | null {
  const raw = coverUrl?.trim();
  if (!raw) return null;

  const origin = getApiOrigin().replace(/\/$/, "");

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      const parsed = new URL(raw);
      if (parsed.pathname.startsWith("/media/")) {
        return `${origin}${parsed.pathname}${parsed.search}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path.startsWith("/media/")) {
    return `${origin}${path}`;
  }
  return `${origin}/media/${path.replace(/^\//, "")}`;
}
