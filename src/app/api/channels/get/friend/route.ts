import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getFriendChannel } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const friendId = req.nextUrl.searchParams.get("friendId");
  const userId = req.auth.user.id;

  if (!friendId || !userId) {
    return NextResponse.json(
      { success: false, message: "Friend ID and User ID are required" },
      { status: 400 },
    );
  }

  try {
    const channel = await getFriendChannel(userId, friendId);

    if (!channel) {
      return NextResponse.json(
        { success: false, message: "Channel not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, channel });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
