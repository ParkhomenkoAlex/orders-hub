import { createRealtimeServer, parseAllowedOrigins, parsePort } from "./createRealtimeServer";

const main = async () => {
    try {
        const realtimeServer = createRealtimeServer({
            allowedOrigins: parseAllowedOrigins(),
            port: parsePort(),
        });
        const port = await realtimeServer.listen();
        console.info(`Socket.IO active-tab service listening on port ${port}.`);

        let shuttingDown = false;
        const shutdown = async (signal: string) => {
            if (shuttingDown) return;
            shuttingDown = true;
            console.info(`Received ${signal}; stopping Socket.IO active-tab service.`);

            try {
                await realtimeServer.close();
                process.exit(0);
            } catch (error) {
                console.error("Unable to stop Socket.IO active-tab service cleanly.", error);
                process.exit(1);
            }
        };

        process.once("SIGINT", () => void shutdown("SIGINT"));
        process.once("SIGTERM", () => void shutdown("SIGTERM"));
    } catch (error) {
        console.error("Unable to start Socket.IO active-tab service.", error);
        process.exitCode = 1;
    }
};

void main();
