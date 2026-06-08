import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createChannel } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const { SCGId, name, friendId, sessionUserId } = (await req.json()) as {
      SCGId?: string;
      name?: string;
      friendId?: string;
      sessionUserId?: string;
    };
    const channel = await createChannel(SCGId, name, friendId, sessionUserId);
    return NextResponse.json({ success: true, channel }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
