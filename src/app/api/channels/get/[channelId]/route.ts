import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getChannelById } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { channelId } = await params;
  if (!channelId) {
    return NextResponse.json(
      { success: false, message: "Channel ID is required" },
      { status: 400 },
    );
  }

  try {
    const userId = req.auth?.user?.id;
    const channel = await getChannelById(channelId);
    if (!channel?.users.find((u) => u.id === userId)) {
      return NextResponse.json(
        { success: false, message: "Channel not found or access denied" },
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
