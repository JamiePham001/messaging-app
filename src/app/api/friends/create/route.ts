import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
  createFriendRequest,
  findExistingFriendRequest,
} from "@/lib/db/queries";
import { NextAuthRequest } from "next-auth";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { senderId, receiverId } = (await req.json()) as {
      senderId: string;
      receiverId: string;
    };

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { success: false, message: "Missing senderId or receiverId" },
        { status: 400 },
      );
    }

    const existingRequest = await findExistingFriendRequest(
      senderId,
      receiverId,
    );
    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "Friend request already exists" },
        { status: 400 },
      );
    }

    await createFriendRequest(senderId, receiverId);
    return NextResponse.json(
      { success: true, message: "Friend request sent" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: `Internal server error: ${error}` },
      { status: 500 },
    );
  }
});
