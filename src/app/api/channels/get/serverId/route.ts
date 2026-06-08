import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getServerChannels } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const serverId = req.nextUrl.searchParams.get("serverId");
  if (!serverId) {
    return NextResponse.json(
      { success: false, message: "Server ID is required" },
      { status: 400 },
    );
  }

  try {
    const channels = await getServerChannels(serverId);

    if (!channels) {
      return NextResponse.json(
        { success: false, message: "Channels not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, channels });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
