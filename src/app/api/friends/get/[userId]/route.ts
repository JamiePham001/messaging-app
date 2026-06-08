import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getFriendsList } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { userId } = await params;

  try {
    const friends = await getFriendsList(userId);

    if (!friends) {
      return NextResponse.json(
        { success: false, message: "Friends not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, friends });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
