import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { updateRank, checkAdmin } from "@/lib/db/queries";
import type { NextAuthRequest } from "next-auth";

export const PATCH = auth(async function PATCH(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get("serverId");
  const roleId = searchParams.get("roleId");
  const rank = searchParams.get("rank");

  if (!serverId || !roleId || !rank) {
    return NextResponse.json(
      { success: false, message: "Missing serverId, roleId, or rank" },
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
    await updateRank(roleId, Number(rank));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
