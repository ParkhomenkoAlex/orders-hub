export interface SessionCount {
    count: number;
}

export type ClientToServerEvents = Record<never, never>;

export interface ServerToClientEvents {
    "sessions:update": (sessionCount: SessionCount) => void;
}

export type InterServerEvents = Record<never, never>;

export type SocketData = Record<string, never>;
