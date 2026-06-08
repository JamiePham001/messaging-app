import { signIn } from "@/auth";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
      className="flex flex-col w-100%"
    >
      <button
        type="submit"
        className="bg-[grey] h-8 rounded text-white pointer hover:bg-[DimGrey] transition-colors duration-300"
      >
        Sign in with Github
      </button>
    </form>
  );
}
