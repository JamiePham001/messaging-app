import LoginForm from "./loginForm";
import Link from "next/link";

export default async function Signin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  return (
    <main className="relative flex column items-center justify-center h-[100vh]">
      <div className="flex flex-col gap-4 p-10 rounded-[10px] bg-[var(--secondary)] h-100 w-120 top-[calc(50%-6rem)] left-1/2 absolute -translate-x-1/2 -translate-y-1/2">
        <LoginForm callbackUrl={callbackUrl}></LoginForm>
        {error === "CredentialsSignin" && (
          <p className="text-[salmon] text-sm">Invalid email or password.</p>
        )}

        <div className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-[cornflowerblue] hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
