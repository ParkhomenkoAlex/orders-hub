import type { Socket } from "socket.io-client";
import { get } from "node:http";
import { io as createClient } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import { createRealtimeServer, type RealtimeServer } from "./createRealtimeServer";
import type { ClientToServerEvents, ServerToClientEvents, SessionCount } from "./protocol";

type RealtimeClient = Socket<ServerToClientEvents, ClientToServerEvents>;

const allowedOrigin = "http://localhost:3000";
const testTimeout = 2_000;

const waitForCount = (socket: RealtimeClient, expectedCount: number) =>
    new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
            socket.off("sessions:update", handleUpdate);
            reject(new Error(`Timed out waiting for active-tab count ${expectedCount}.`));
        }, testTimeout);

        const handleUpdate = ({ count }: SessionCount) => {
            if (count !== expectedCount) return;
            clearTimeout(timeout);
            socket.off("sessions:update", handleUpdate);
            resolve();
        };

        socket.on("sessions:update", handleUpdate);
    });

const waitForConnectionError = (socket: RealtimeClient) =>
    new Promise<Error>((resolve, reject) => {
        const timeout = setTimeout(
            () => reject(new Error("Timed out waiting for connection error.")),
            testTimeout,
        );
        socket.once("connect", () => {
            clearTimeout(timeout);
            reject(new Error("Socket unexpectedly connected."));
        });
        socket.once("connect_error", (error) => {
            clearTimeout(timeout);
            resolve(error);
        });
    });

const createTestClient = (url: string, origin = allowedOrigin) =>
    createClient(url, {
        autoConnect: false,
        extraHeaders: { origin },
        forceNew: true,
        reconnection: false,
        transports: ["websocket"],
    });

const getHealth = (url: string) =>
    new Promise<{ body: unknown; statusCode: number | undefined }>((resolve, reject) => {
        const request = get(`${url}/health`, (response) => {
            let body = "";
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
                body += chunk;
            });
            response.on("end", () => {
                resolve({ body: JSON.parse(body), statusCode: response.statusCode });
            });
        });
        request.on("error", reject);
    });

describe("Socket.IO active-tab service", () => {
    let realtimeServer: RealtimeServer | undefined;
    const clients: RealtimeClient[] = [];

    const startServer = async () => {
        realtimeServer = createRealtimeServer({
            allowedOrigins: [allowedOrigin],
            host: "127.0.0.1",
            port: 0,
        });
        const port = await realtimeServer.listen();
        return `http://127.0.0.1:${port}`;
    };

    afterEach(async () => {
        clients.splice(0).forEach((client) => client.disconnect());
        await realtimeServer?.close();
        realtimeServer = undefined;
    });

    it("broadcasts the first and second active-tab counts", async () => {
        const url = await startServer();
        const firstClient = createTestClient(url);
        clients.push(firstClient);

        const firstCount = waitForCount(firstClient, 1);
        firstClient.connect();
        await firstCount;

        const secondClient = createTestClient(url);
        clients.push(secondClient);
        const firstClientUpdate = waitForCount(firstClient, 2);
        const secondClientUpdate = waitForCount(secondClient, 2);
        secondClient.connect();

        await Promise.all([firstClientUpdate, secondClientUpdate]);
    });

    it("updates clients after disconnecting and reconnecting a tab", async () => {
        const url = await startServer();
        const firstClient = createTestClient(url);
        const secondClient = createTestClient(url);
        clients.push(firstClient, secondClient);

        const firstCount = waitForCount(firstClient, 1);
        firstClient.connect();
        await firstCount;

        const firstClientSecondCount = waitForCount(firstClient, 2);
        const secondClientSecondCount = waitForCount(secondClient, 2);
        secondClient.connect();
        await Promise.all([firstClientSecondCount, secondClientSecondCount]);

        const remainingCount = waitForCount(firstClient, 1);
        secondClient.disconnect();
        await remainingCount;

        const restoredFirstCount = waitForCount(firstClient, 2);
        const restoredSecondCount = waitForCount(secondClient, 2);
        secondClient.connect();
        await Promise.all([restoredFirstCount, restoredSecondCount]);
    });

    it("rejects connections from origins outside the allowlist", async () => {
        const url = await startServer();
        const rejectedClient = createTestClient(url, "https://unapproved.example");
        clients.push(rejectedClient);

        const connectionError = waitForConnectionError(rejectedClient);
        rejectedClient.connect();

        await expect(connectionError).resolves.toBeInstanceOf(Error);
    });

    it("starts and stops cleanly without clients", async () => {
        await startServer();
        await realtimeServer?.close();
        realtimeServer = undefined;
    });

    it("returns a minimal health response without a browser origin", async () => {
        const url = await startServer();

        await expect(getHealth(url)).resolves.toEqual({ body: { status: "ok" }, statusCode: 200 });
    });
});
