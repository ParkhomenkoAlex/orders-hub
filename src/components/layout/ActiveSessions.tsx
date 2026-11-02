"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useTranslation } from "@/i18n/I18nProvider";
import type { ClientToServerEvents, ServerToClientEvents, SessionCount } from "@/realtime/protocol";

type ConnectionStatus = "connecting" | "reconnecting" | "unavailable" | "connected";
type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const realtimeUrl = process.env.NEXT_PUBLIC_REALTIME_URL;

interface ActiveSessionsProps {
    className: string;
    dotClassName: string;
    offlineDotClassName: string;
}

const getStatusLabel = (
    status: ConnectionStatus,
    sessions: ReturnType<typeof useTranslation>["t"]["sessions"],
) => {
    switch (status) {
        case "connecting":
            return sessions.connecting;
        case "reconnecting":
            return sessions.reconnecting;
        case "connected":
            return sessions.unavailable;
        case "unavailable":
            return sessions.unavailable;
    }
};

export function ActiveSessions({
    className,
    dotClassName,
    offlineDotClassName,
}: ActiveSessionsProps) {
    const { t } = useTranslation();
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

    const label = count === null ? getStatusLabel(status, t.sessions) : String(count);
    const isConnected = count !== null && status === "connected";
    const accessibleLabel = t.sessions.active.replace("{count}", label);

    return (
        <div className={className} role="status" aria-live="polite" aria-label={accessibleLabel}>
            <span
                className={`${dotClassName} ${isConnected ? "" : offlineDotClassName}`}
                aria-hidden="true"
            />
            {t.sessions.label}: {label}
        </div>
    );
}
