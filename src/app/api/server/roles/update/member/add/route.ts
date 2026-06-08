import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { addUserToRole, checkAdmin } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const PATCH = auth(async function PATCH(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get("roleId");
  const userId = searchParams.get("userId");
  const serverId = searchParams.get("serverId");

  if (!roleId || !userId || !serverId) {
    return NextResponse.json(
      { success: false, message: "Missing roleId, userId, or serverId" },
      { status: 400 },
    );
  }

  const isAdmin = await checkAdmin(serverId, req.auth.user.id);

  if (!isAdmin) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 },
    );
  }

  try {
    await addUserToRole(roleId, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
