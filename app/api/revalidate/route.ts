import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  invalidateCache();
  return NextResponse.json({ success: true, message: "Cache invalidado" });
}
