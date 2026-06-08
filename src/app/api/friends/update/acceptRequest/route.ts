import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { acceptFriendRequest } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const PATCH = auth(async function PATCH(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "Request ID is required" },
        { status: 400 },
      );
    }

    const updatedRequest = await acceptFriendRequest(requestId);
    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
