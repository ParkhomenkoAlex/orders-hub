import { createServer, type Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "./protocol";

export const DEFAULT_REALTIME_PORT = 3001;
export const DEFAULT_REALTIME_HOST = "0.0.0.0";
export const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000"];

type RealtimeIo = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type RealtimeSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export interface RealtimeServerOptions {
    allowedOrigins: readonly string[];
    host?: string;
    port?: number;
}

export interface RealtimeServer {
    close: () => Promise<void>;
    io: RealtimeIo;
    listen: () => Promise<number>;
}

export const parseAllowedOrigins = (value = process.env.REALTIME_ALLOWED_ORIGINS) => {
    const origins = (value === undefined ? DEFAULT_ALLOWED_ORIGINS : value.split(","))
        .map((origin) => origin.trim())
        .filter(Boolean);

    if (!origins.length) {
        throw new Error("REALTIME_ALLOWED_ORIGINS must contain at least one origin.");
    }

    for (const origin of origins) {
        try {
            const url = new URL(origin);
            if (url.origin !== origin) {
                throw new Error();
            }
        } catch {
            throw new Error(`REALTIME_ALLOWED_ORIGINS contains an invalid origin: ${origin}.`);
        }
    }

    return origins;
};

export const parsePort = (value = process.env.PORT || process.env.REALTIME_PORT) => {
    if (!value) return DEFAULT_REALTIME_PORT;

    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT or REALTIME_PORT must be an integer between 1 and 65535.");
    }

    return port;
};

export const createRealtimeServer = ({
    allowedOrigins,
    host = DEFAULT_REALTIME_HOST,
    port = DEFAULT_REALTIME_PORT,
}: RealtimeServerOptions): RealtimeServer => {
    const httpServer: HttpServer = createServer((request, response) => {
        if (request.method === "GET" && request.url === "/health") {
            response.writeHead(200, {
                "cache-control": "no-store",
                "content-type": "application/json; charset=utf-8",
            });
            response.end(JSON.stringify({ status: "ok" }));
            return;
        }

        response.writeHead(404).end();
    });
    const activeSocketIds = new Set<string>();
    const isAllowedOrigin = (origin: string | undefined) =>
        Boolean(origin && allowedOrigins.includes(origin));

    const io: RealtimeIo = new Server(httpServer, {
        allowRequest: (request, callback) => {
            if (isAllowedOrigin(request.headers.origin)) {
                callback(null, true);
                return;
            }

            callback("Origin is not allowed.", false);
        },
        cors: {
            methods: ["GET", "POST"],
            origin: [...allowedOrigins],
        },
        pingInterval: 25_000,
        pingTimeout: 20_000,
        transports: ["websocket"],
    });

    const broadcastCount = () => {
        io.emit("sessions:update", { count: activeSocketIds.size });
    };

    io.on("connection", (socket: RealtimeSocket) => {
        activeSocketIds.add(socket.id);
        broadcastCount();

        socket.on("disconnect", () => {
            if (activeSocketIds.delete(socket.id)) {
                broadcastCount();
            }
        });
    });

    return {
        io,
        listen: () =>
            new Promise<number>((resolve, reject) => {
                const handleError = (error: Error) => {
                    httpServer.off("listening", handleListening);
                    reject(error);
                };
                const handleListening = () => {
                    httpServer.off("error", handleError);
                    const address = httpServer.address();
                    if (!address || typeof address === "string") {
                        reject(new Error("Realtime server did not expose a TCP port."));
                        return;
                    }

                    resolve(address.port);
                };

                httpServer.once("error", handleError);
                httpServer.once("listening", handleListening);
                httpServer.listen(port, host);
            }),
        close: () =>
            new Promise<void>((resolve, reject) => {
                if (!httpServer.listening) {
                    resolve();
                    return;
                }

                io.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            }),
    };
};
