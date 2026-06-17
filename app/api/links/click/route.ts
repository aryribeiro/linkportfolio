import { NextRequest, NextResponse } from "next/server";
import { fetchAppData } from "@/lib/db";
import { getCache } from "@/lib/cache";
import { AppData } from "@/lib/types";
import { z } from "zod";

const clickSchema = z.object({
  id: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = clickSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const data = await fetchAppData();
    const link = data.links.find((l) => l.id === parsed.data.id);

    if (link) {
      link.clicks = (link.clicks || 0) + 1;
      const cache = getCache<AppData>();
      cache.set(data);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
