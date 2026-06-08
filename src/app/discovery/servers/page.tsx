"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ServerDiscoveryPage() {
  const router = useRouter();
  return (
    <div className="flex h-full w-full items-center justify-center flex-col gap-[2rem]">
      <h1 className="text-2xl font-bold">Server Discovery Coming Soon!</h1>
      <Link
        href="/"
        className="px-6 py-3 bg-[var(--button)] text-[var(--button-text)] rounded-lg hover:bg-[var(--button-hover)] transition"
        onClick={() => router.back()}
      >
        Back
      </Link>
    </div>
  );
}
