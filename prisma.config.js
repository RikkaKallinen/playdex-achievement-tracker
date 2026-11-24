import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 doesn't read .env by itself, so load it here (Node's built-in loader, no extra package).
// Online there's no .env file: the host passes the same values in as environment variables instead
if (existsSync(".env")) {
    process.loadEnvFile();
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations" },
    // Migrations use the direct address; the app itself uses the pooled DATABASE_URL (see server/db.js)
    datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL }
});
