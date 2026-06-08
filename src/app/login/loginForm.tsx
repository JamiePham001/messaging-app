"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninForm({ callbackUrl }: { callbackUrl?: string }) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl ?? "/channels/me");
    router.refresh();
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
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray]"
        required
      />
      <label htmlFor="password" className="flex gap-1">
        Password <div className="text-[salmon]">*</div>
      </label>
      <input
        type="password"
        id="password"
        name="password"
        className="bg-[var(--inputs)] h-8 rounded p-2 caret-white border-solid border-[1px] border-[dimgray]"
        required
      />

      <br />
      {error && <p className="text-[salmon] text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-[cornflowerblue] h-8 p-2 rounded text-white pointer hover:bg-[dodgerblue] transition-colors duration-300 justify-center items-center flex"
      >
        Log In
      </button>
    </form>
  );
}
