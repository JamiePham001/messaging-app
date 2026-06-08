"use client";

/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { useRouter } from "next/navigation";

// usage example:
// import { notFound } from "next/navigation";

// const user = await prisma.user.findUnique({ where: { id } });
// if (!user) notFound(); // triggers not-found.tsx

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[white] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[white] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--subtitle)] mb-8">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--button)] text-[var(--button-text)] rounded-lg hover:bg-[var(--button-hover)] transition"
          onClick={() => router.back()}
        >
          Back
        </Link>
      </div>
    </div>
  );
}
