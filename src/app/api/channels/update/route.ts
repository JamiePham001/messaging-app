import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { setChannelVisibility } from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const PATCH = auth(async function PATCH(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { channelId, visible } = await req.json();
    if (!channelId) {
      return NextResponse.json(
        { success: false, message: "Channel ID is required" },
        { status: 400 },
      );
    }

    const updatedRequest = await setChannelVisibility(channelId, visible);
    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
});
