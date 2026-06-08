import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getServerMembers } from "@/lib/db/queries";
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
      { success: false, message: "Server ID is required" },
      { status: 400 },
    );
  }

  try {
    const members = await getServerMembers(serverId);
    return NextResponse.json({ success: true, members });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});