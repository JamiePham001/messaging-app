import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const GET = auth(async function GET(
  req: NextAuthRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
