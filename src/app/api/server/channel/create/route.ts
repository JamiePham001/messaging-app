import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createServerChannel, checkAdmin } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { SCGId, name, serverId, exclusiveUserIds, exclusiveRolesIds } =
      (await req.json()) as {
        SCGId: string;
        name: string;
        serverId: string;
        exclusiveUserIds?: string[];
        exclusiveRolesIds?: string[];
      };

    if (exclusiveUserIds && exclusiveRolesIds) {
      const isAdmin = await checkAdmin(serverId, req.auth.user.id);

      if (!isAdmin) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const channel = await createServerChannel(
      SCGId,
      name,
      exclusiveUserIds,
      exclusiveRolesIds,
    );
    return NextResponse.json({ success: true, channel }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
