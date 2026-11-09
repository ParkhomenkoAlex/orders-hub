import { spawn } from "node:child_process";
import { loadTestDatabaseUrl } from "../tests/test-database";

const run = async () => {
    const databaseUrl = loadTestDatabaseUrl();
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(command, ["drizzle-kit", "migrate"], {
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: "inherit",
    });

    await new Promise<void>((resolveRun, reject) => {
        child.once("error", reject);
        child.once("exit", (code, signal) => {
            if (code === 0) {
                resolveRun();
                return;
            }

            reject(
                new Error(
                    `Test migrations exited with code ${code ?? "unknown"}${signal ? ` (${signal})` : ""}.`,
                ),
            );
        });
    });
};

void run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unable to run test migrations.");
    process.exitCode = 1;
});
