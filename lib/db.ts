import { AppData } from "./types";
import { getCache } from "./cache";

export async function fetchAppData(): Promise<AppData> {
  const cache = getCache<AppData>();

  const cached = cache.get();
  if (cached) return cached;

  const url = process.env.GOOGLE_DRIVE_JSON_URL;
  if (!url) {
    throw new Error("GOOGLE_DRIVE_JSON_URL not configured");
  }

  try {
    const response = await fetch(url, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Google Drive responded with ${response.status}`);
    }

    const raw = await response.json();

    const data: AppData = {
      profile: {
        name: raw.profile?.name || "Seu Nome",
        description: raw.profile?.description || "",
        image: raw.profile?.image || null,
      },
      links: Array.isArray(raw.links)
        ? raw.links.map((link: Record<string, unknown>) => ({
            id: link.id || Date.now(),
            title: link.title || "",
            url: link.url || "#",
            icon: link.icon || "",
            category: link.category || "Outros",
            clicks: link.clicks || 0,
          }))
        : [],
      customIcons: Array.isArray(raw.customIcons)
        ? raw.customIcons.map((icon: Record<string, unknown>) => ({
            name: icon.name || "",
            url: icon.url || "",
          }))
        : [],
    };

    cache.set(data);
    return data;
  } catch (error) {
    const stale = cache.getStale();
    if (stale) return stale;

    console.error("[db] Failed to fetch from Google Drive:", error);
    throw new Error("Unable to load data. Google Drive is unreachable and no cache available.");
  }
}

export function invalidateCache(): void {
  const cache = getCache<AppData>();
  cache.invalidate();
}
