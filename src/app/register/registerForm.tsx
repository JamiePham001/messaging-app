"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoadingCursor } from "@/lib/utiils/cursor/loading";

export default function RegisterForm({
  callbackUrl,
}: {
  callbackUrl?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  LoadingCursor(loading);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    const email = formData.get("email") as string;
    const displayName = formData.get("displayName") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    try {
      setLoading(true);
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, displayName, username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message ?? "Failed to create user");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Login failed after registration. Please log in manually.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl ?? "/channels/me");
      router.refresh();
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 h-100% ">
      <label htmlFor="email" className="flex gap-1">
        Email <div className="text-[salmon]">*</div>
      </label>
      <input
        type="email"
        id="email"
        disabled={loading}
        name="email"
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />
      <label htmlFor="displayName" className="flex gap-1">
        Display Name
      </label>
      <input
        type="text"
        id="displayName"
        disabled={loading}
        name="displayName"
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />
      <label htmlFor="username" className="flex gap-1">
        Username <div className="text-[salmon]">*</div>
      </label>
      <input
        type="text"
        id="username"
        disabled={loading}
        name="username"
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />
      <label htmlFor="password" className="flex gap-1">
        Password <div className="text-[salmon]">*</div>
      </label>
      <input
        type="password"
        disabled={loading}
        id="password"
        name="password"
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray] disabled:opacity-50"
        required
      />
      {error && <p className="text-[salmon] text-sm">{error}</p>}

      <br />
      <button
        type="submit"
        disabled={loading}
        className="bg-[cornflowerblue] h-8 p-2 rounded text-white pointer hover:bg-[dodgerblue] transition-colors duration-300 justify-center items-center flex disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
