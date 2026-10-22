import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
}

export default defineConfig({
    dialect: "mysql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: databaseUrl,
    },
});
