import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getChannelByUserId } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const channel = await getChannelByUserId(userId);
    return NextResponse.json({ success: true, channel });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
