"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";

export default function SigninForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  LoadingCursor(loading);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl ?? "/channels/me");
    router.refresh();
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-100% ">
      <label htmlFor="email" className="flex gap-1">
        Email <div className="text-[salmon]">*</div>
      </label>
      <input
        type="email"
        id="email"
        name="email"
        disabled={loading}
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />
      <label htmlFor="password" className="flex gap-1">
        Password <div className="text-[salmon]">*</div>
      </label>
      <input
        type="password"
        id="password"
        name="password"
        disabled={loading}
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />

      <br />
      {error && <p className="text-[salmon] text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[cornflowerblue] h-8 p-2 rounded text-white pointer hover:bg-[dodgerblue] transition-colors duration-300 justify-center items-center flex disabled:opacity-50"
      >
        {loading ? "Logging In..." : "Log In"}
      </button>
    </form>
  );
}
