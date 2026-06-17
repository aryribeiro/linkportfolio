import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  password: z.string().min(1),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde 1 minuto." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Senha é obrigatória." }, { status: 400 });
    }

    const valid = await verifyPassword(parsed.data.password);

    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta!" }, { status: 401 });
    }

    const token = generateToken();
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
