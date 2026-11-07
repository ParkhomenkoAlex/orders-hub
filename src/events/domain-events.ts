import type { Order } from "@/types/domain";

export interface OrderCreatedEvent {
    name: "order.created";
    occurredAt: string;
    payload: Pick<Order, "id" | "title" | "createdAt">;
}

export type DomainEvent = OrderCreatedEvent;
export type DomainEventName = DomainEvent["name"];
export type DomainEventHandler = (event: DomainEvent) => void | Promise<void>;

export const createOrderCreatedEvent = (
    order: Order,
    occurredAt = new Date().toISOString(),
): OrderCreatedEvent => ({
    name: "order.created",
    occurredAt,
    payload: {
        id: order.id,
        title: order.title,
        createdAt: order.createdAt,
    },
});
