import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getRolesByUserId, checkAdmin } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const userId = searchParams.get("userId");

  if (!serverId || !userId) {
    return NextResponse.json(
      { success: false, message: "Missing serverId or userId" },
      { status: 400 },
    );
  }

  if (req.auth.user.id !== userId) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    const roles = await getRolesByUserId(serverId, userId);
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
