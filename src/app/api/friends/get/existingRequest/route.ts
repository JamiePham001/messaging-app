import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { checkRequestExists } from "@/lib/db/queries";
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
  const receiverId = searchParams.get("receiverId");

  if (!userId || !receiverId) {
    return NextResponse.json(
      { success: false, message: "Missing userId or receiverId" },
      { status: 400 },
    );
  }

  try {
    const friendRequestExists = await checkRequestExists(userId, receiverId);
    return NextResponse.json({ success: true, friendRequestExists });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
