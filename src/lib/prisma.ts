import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString: string | undefined = process.env.DATABASE_URL;

const pool: Pool = new Pool({ connectionString });

const adapter: PrismaPg = new PrismaPg(pool);

const prisma: PrismaClient = new PrismaClient({ adapter });

export { prisma };
