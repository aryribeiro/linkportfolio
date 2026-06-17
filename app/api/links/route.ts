import { NextRequest, NextResponse } from "next/server";
import { fetchAppData } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getCache } from "@/lib/cache";
import { AppData } from "@/lib/types";
import { z } from "zod";

const linkSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  url: z.string().min(1),
  icon: z.string(),
  category: z.string().min(1),
  clicks: z.number().optional(),
});

const updateSchema = z.object({
  links: z.array(linkSchema),
  profile: z.object({
    name: z.string().min(1),
    description: z.string(),
    photo: z.string().min(1),
  }).optional(),
  categories: z.array(z.string()).optional(),
  customIcons: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

function getToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("admin_token");
  return cookie?.value || null;
}

export async function GET() {
  try {
    const data = await fetchAppData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const appData: AppData = {
      profile: parsed.data.profile || { name: "", description: "", photo: "/foto/foto_perfil.jpg" },
      links: parsed.data.links,
      categories: parsed.data.categories || [],
      customIcons: parsed.data.customIcons || [],
    };

    const cache = getCache<AppData>();
    cache.set(appData);

    return NextResponse.json({ success: true, data: appData });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
