import type { OrderCreatedEvent } from "./domain-events";

export interface OrderCreatedAuditLogger {
    info: (message: string) => void;
}

export const createOrderCreatedAuditConsumer =
    (logger: OrderCreatedAuditLogger = console) =>
    (event: OrderCreatedEvent) => {
        logger.info(
            JSON.stringify({
                message: "Domain event processed",
                eventName: event.name,
                orderId: event.payload.id,
                orderCreatedAt: event.payload.createdAt,
                occurredAt: event.occurredAt,
            }),
        );
    };

export interface OrderCreatedMetrics {
    consume: (event: OrderCreatedEvent) => void;
    getSnapshot: () => { count: number; latestEventAt: string | null };
}

export const createOrderCreatedMetrics = (): OrderCreatedMetrics => {
    let count = 0;
    let latestEventAt: string | null = null;

    return {
        consume: (event) => {
            count += 1;
            latestEventAt = event.occurredAt;
        },
        getSnapshot: () => ({ count, latestEventAt }),
    };
};
