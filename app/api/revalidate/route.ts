import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getCache } from "@/lib/cache";
import { AppData } from "@/lib/types";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = process.env.GOOGLE_DRIVE_JSON_URL;
  if (!url) {
    return NextResponse.json({ error: "GOOGLE_DRIVE_JSON_URL not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Google Drive respondeu com ${response.status}` },
        { status: 502 }
      );
    }

    const raw = await response.json();

    const data: AppData = {
      profile: {
        name: raw.profile?.name || "Seu Nome",
        description: raw.profile?.description || "",
        photo: raw.profile?.photo || "/foto/foto_perfil.jpg",
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
      categories: Array.isArray(raw.categories) ? raw.categories : [],
      customIcons: Array.isArray(raw.customIcons)
        ? raw.customIcons.map((icon: Record<string, unknown>) => ({
            name: icon.name || "",
            url: icon.url || "",
          }))
        : [],
    };

    const cache = getCache<AppData>();
    cache.invalidate();
    cache.set(data);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Falha ao buscar do Google Drive" }, { status: 502 });
  }
}
