"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, SessionCount } from "@/realtime/protocol";

type ConnectionStatus = "connecting" | "reconnecting" | "unavailable" | "connected";
type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

interface ActiveSessionsProps {
    className: string;
    dotClassName: string;
    offlineDotClassName: string;
}

const getStatusLabel = (status: ConnectionStatus) => {
    switch (status) {
        case "connecting":
            return "connecting";
        case "reconnecting":
            return "reconnecting";
        case "connected":
            return "unavailable";
        case "unavailable":
            return "unavailable";
    }
};

export function ActiveSessions({
    className,
    dotClassName,
    offlineDotClassName,
}: ActiveSessionsProps) {
    const [count, setCount] = useState<number | null>(null);
    const [status, setStatus] = useState<ConnectionStatus>(
        realtimeUrl ? "connecting" : "unavailable",
    );

    useEffect(() => {
        if (!realtimeUrl) return;

        const socket: RealtimeSocket = io(realtimeUrl, {
            reconnection: true,
            reconnectionDelay: 1_000,
            reconnectionDelayMax: 5_000,
            transports: ["websocket"],
        });

        const handleSessionUpdate = ({ count: nextCount }: SessionCount) => {
            setCount(nextCount);
            setStatus("connected");
        };
        const handleDisconnect = () => {
            setCount(null);
            setStatus("reconnecting");
        };
        const handleConnectError = () => {
            setCount(null);
            setStatus("unavailable");
        };
        const handleReconnectAttempt = () => {
            setCount(null);
            setStatus("reconnecting");
        };

        socket.on("sessions:update", handleSessionUpdate);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.io.on("reconnect_attempt", handleReconnectAttempt);

        return () => {
            socket.off("sessions:update", handleSessionUpdate);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.io.off("reconnect_attempt", handleReconnectAttempt);
            socket.disconnect();
        };
    }, []);

    const label = count === null ? getStatusLabel(status) : String(count);
    const isConnected = count !== null && status === "connected";

    return (
        <div
            className={className}
            role="status"
            aria-live="polite"
            aria-label={`Active sessions: ${label}`}
        >
            <span
                className={`${dotClassName} ${isConnected ? "" : offlineDotClassName}`}
                aria-hidden="true"
            />
            Sessions: {label}
        </div>
    );
}
