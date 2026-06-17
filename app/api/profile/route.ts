import { NextRequest, NextResponse } from "next/server";
import { fetchAppData } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getCache } from "@/lib/cache";
import { AppData } from "@/lib/types";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  photo: z.string().min(1),
});

function getToken(request: NextRequest): string | null {
  const cookie = request.cookies.get("admin_token");
  return cookie?.value || null;
}

export async function PUT(request: NextRequest) {
  const token = getToken(request);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const currentData = await fetchAppData();
    currentData.profile = parsed.data;

    const cache = getCache<AppData>();
    cache.set(currentData);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
