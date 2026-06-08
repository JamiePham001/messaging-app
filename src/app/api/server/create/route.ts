import { createServer } from "@/lib/db/queries";
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
    const { name, publicType, sessionUserId } = (await req.json()) as {
      name: string;
      publicType: boolean;
      sessionUserId: string;
    };

    if (!name || publicType === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing name or publicType" },
        { status: 400 },
      );
    }

    const server = await createServer(name, publicType, sessionUserId);
    return NextResponse.json({ success: true, server }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `"Failed to create server: ${error}"` },
      { status: 500 },
    );
  }
});
