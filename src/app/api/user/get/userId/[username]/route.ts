import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserIdByUsername } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { username } = await params;

  try {
    const userId = await getUserIdByUsername(username);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
