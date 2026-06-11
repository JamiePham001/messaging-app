import { createServerInvite } from "@/lib/db/queries";
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
    const { serverId } = (await req.json()) as {
      serverId: string;
    };

    if (!serverId) {
      return NextResponse.json(
        { success: false, message: "Missing serverId" },
        { status: 400 },
      );
    }

    const invite = await createServerInvite(serverId);
    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `"Failed to create server invite: ${error}"` },
      { status: 500 },
    );
  }
});
