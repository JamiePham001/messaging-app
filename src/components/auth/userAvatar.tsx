import { auth } from "@/auth";

export default async function UserAvatar() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div>
      <img src={"/vercel.svg"} alt="User Avatar" />
    </div>
  );
}
