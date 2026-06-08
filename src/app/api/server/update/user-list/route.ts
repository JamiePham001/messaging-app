import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { userJoinServer } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const PATCH = auth(async function PATCH(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const url = new URL(req.url);
    const serverId = url.searchParams.get("serverId");
    const userId = url.searchParams.get("userId");
    if (!serverId || !userId) {
      return NextResponse.json(
        { success: false, message: "Server ID and User ID are required" },
        { status: 400 },
      );
    }

    const updatedServer = await userJoinServer(serverId, userId);
    return NextResponse.json({ success: true, data: updatedServer });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
