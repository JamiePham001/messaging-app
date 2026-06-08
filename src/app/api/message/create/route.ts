import { createMessage } from "@/lib/db/queries";
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
    const { channelId, content } = (await req.json()) as {
      channelId: string;
      content: string;
    };

    if (!channelId || !content) {
      return NextResponse.json(
        { success: false, message: "Missing channelId or content" },
        { status: 400 },
      );
    }

    const message = await createMessage(channelId, req.auth.user.id, content);
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `"Failed to create message: ${error}"` },
      { status: 500 },
    );
  }
});
