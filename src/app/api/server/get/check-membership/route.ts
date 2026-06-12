import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkUserMembership } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const serverId = searchParams.get("serverId");

  if (!userId || !serverId) {
    return NextResponse.json(
      { success: false, message: "User ID and Server ID are required" },
      { status: 400 },
    );
  }

  try {
    const membership = await checkUserMembership(serverId, userId);

    if (!membership) {
      return NextResponse.json(
        { success: false, message: "User is not a member of the server" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, membership });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
