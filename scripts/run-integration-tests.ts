import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { loadTestDatabaseUrl } from "../tests/test-database";

const run = async () => {
    const databaseUrl = loadTestDatabaseUrl();
    const vitestEntry = resolve("node_modules/vitest/vitest.mjs");
    const child = spawn(
        process.execPath,
        [vitestEntry, "run", "--config", "vitest.integration.config.ts"],
        {
            env: { ...process.env, DATABASE_URL: databaseUrl },
            stdio: "inherit",
        },
    );

    await new Promise<void>((resolveRun, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (code === 0) {
                resolveRun();
                return;
            }

            reject(
                new Error(
                    `Integration tests exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}.`,
                ),
            );
        });
    });
};

void run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unable to run integration tests.");
    process.exitCode = 1;
});
