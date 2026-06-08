import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { setStatus } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { email, status } = (await req.json()) as {
      email: string;
      status: string;
    };
    const user = await setStatus(email, status);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
