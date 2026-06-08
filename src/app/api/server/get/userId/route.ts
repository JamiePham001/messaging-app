import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getServerByUserId } from "@/lib/db/queries";
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

  try {
    const servers = await getServerByUserId(userId ?? "");
    return NextResponse.json({ success: true, servers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
