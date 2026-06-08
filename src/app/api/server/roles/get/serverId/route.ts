import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getRolesByServerId, getServerByUserId } from "@/lib/db/queries";
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

  if (!serverId) {
    return NextResponse.json(
      { success: false, message: "Missing serverId" },
      { status: 400 },
    );
  }

  try {
    const roles = await getRolesByServerId(serverId);
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
