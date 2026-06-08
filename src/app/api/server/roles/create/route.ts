import { createRole } from "@/lib/db/queries";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { Prisma } from "@prisma/client";

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  try {
    const { serverId, userId, role, admin, rank } = (await req.json()) as {
      serverId: string;
      userId?: string;
      role: string;
      admin: boolean;
      rank?: number;
    };
    const normalizedRole = role?.trim();

    if (!serverId || !normalizedRole || admin === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing serverId, role, admin, or rank",
        },
        { status: 400 },
      );
    }

    const serverRole = await createRole(
      serverId,
      normalizedRole,
      userId,
      admin,
      rank,
    );
    return NextResponse.json({ success: true, serverRole }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "Role already exists in this server" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create role" },
      { status: 500 },
    );
  }
});
