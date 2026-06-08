import RegisterForm from "./registerForm";
import Link from "next/link";

export default async function Register({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  return (
    <main className="relative flex flex-col items-center justify-center h-[100vh]">
      <div className="flex flex-col gap-4 p-10 rounded-[10px] bg-[var(--secondary)] w-120 top-[calc(50%-6rem)] left-1/2 absolute -translate-x-1/2 -translate-y-1/2">
        <h2 className="text-2xl font-bold text-center">Create an Account</h2>
        <RegisterForm callbackUrl={callbackUrl} />
        {error === "CredentialsSignin" && (
          <p className="text-[salmon] text-sm">Invalid email or password.</p>
        )}

        <div className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[cornflowerblue] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
