import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { getAivenMigrationConnectionOptions } from "./src/db/connection";

const databaseUrl = process.env.AIVEN_DATABASE_URL;

if (!databaseUrl) {
    throw new Error("AIVEN_DATABASE_URL is not configured.");
}

const { drizzleCredentials } = getAivenMigrationConnectionOptions(
    databaseUrl,
    process.env.AIVEN_DATABASE_SSL_CA,
);

export default defineConfig({
    dialect: "mysql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: drizzleCredentials,
});
