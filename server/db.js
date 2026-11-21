import { PrismaPg } from "@prisma/adapter-pg";
// Prisma 7 generates TypeScript; Node 25 runs it directly by stripping the types (no build step needed)
import { PrismaClient } from "./generated/prisma/client.ts";

// One shared connection for the whole server, using Neon's pooled address from .env
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
