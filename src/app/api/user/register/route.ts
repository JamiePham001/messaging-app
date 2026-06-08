import { NextResponse } from "next/server";
import { createUserQuery } from "@/lib/controllers/user";
import { registerSchema } from "@/lib/utiils/auth/zod";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { email, displayName, username, password } = await req.json();
    await registerSchema.parseAsync({ email, displayName, username, password });
    const status = "ONLINE";
    const user = await createUserQuery(
      email,
      displayName,
      username,
      password,
      status,
    );
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with that email already exists.",
        },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
