import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { deleteServer } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const DELETE = auth(async function DELETE(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const isOwner = searchParams.get("isOwner");

  if (isOwner !== "true") {
    return NextResponse.json(
      {
        success: false,
        message: "Only the server owner can delete the server",
      },
      { status: 403 },
    );
  }

  if (!serverId) {
    return NextResponse.json(
      { success: false, message: "Server ID is required" },
      { status: 400 },
    );
  }

  try {
    const server = await deleteServer(serverId);

    return NextResponse.json({ success: true, server });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
