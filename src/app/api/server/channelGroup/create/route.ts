import { createSCG, checkAdmin } from "@/lib/db/queries";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { serverId, name, exclusiveUserIds, exclusiveRolesIds } =
      (await req.json()) as {
        serverId: string;
        name: string;
        exclusiveUserIds?: string[];
        exclusiveRolesIds?: string[];
      };

    if (!serverId || !name) {
      return NextResponse.json(
        { success: false, message: "Missing serverId or name" },
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

    const serverGroup = await createSCG(
      serverId,
      name,
      exclusiveUserIds,
      exclusiveRolesIds,
    );
    return NextResponse.json({ success: true, serverGroup }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Failed to create server group: ${error}` },
      { status: 500 },
    );
  }
});
