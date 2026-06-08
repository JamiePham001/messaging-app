"use server";

import { signIn } from "@/auth";

export async function signInAfterRegister(
  email: string,
  password: string,
  callbackUrl?: string,
) {
  await signIn("credentials", {
    email,
    password,
    redirectTo: callbackUrl ?? "/channels/me",
  });
}
