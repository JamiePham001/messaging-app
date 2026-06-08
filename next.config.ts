import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/client", "prisma"],
  transpilePackages: ["next-auth"],
};

export default nextConfig;
