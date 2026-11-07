import { describe, expect, it, vi } from "vitest";
import { DomainEventDispatcher } from "./domain-event-dispatcher";
import { createOrderCreatedEvent } from "./domain-events";
import {
    createOrderCreatedAuditConsumer,
    createOrderCreatedMetrics,
} from "./order-created-consumers";
import type { Order } from "@/types/domain";

const order: Order = {
    id: "order-1",
    title: "Office equipment",
    createdAt: "2026-11-06",
};

describe("order.created domain event", () => {
    it("publishes the typed persisted-order payload to independent consumers", async () => {
        const dispatcher = new DomainEventDispatcher();
        const auditLog = vi.fn();
        const metrics = createOrderCreatedMetrics();
        const event = createOrderCreatedEvent(order, "2026-11-06T10:00:00.000Z");

        dispatcher.subscribe("order.created", createOrderCreatedAuditConsumer({ info: auditLog }));
        dispatcher.subscribe("order.created", metrics.consume);

        await dispatcher.publish(event);

        expect(auditLog).toHaveBeenCalledWith(
            JSON.stringify({
                message: "Domain event processed",
                eventName: "order.created",
                orderId: order.id,
                orderCreatedAt: order.createdAt,
                occurredAt: event.occurredAt,
            }),
        );
        expect(metrics.getSnapshot()).toEqual({
            count: 1,
            latestEventAt: "2026-11-06T10:00:00.000Z",
        });
    });

    it("isolates a failing consumer so later consumers still receive the event", async () => {
        const dispatcher = new DomainEventDispatcher();
        const received = vi.fn();

        dispatcher.subscribe("order.created", () => {
            throw new Error("audit sink unavailable");
        });
        dispatcher.subscribe("order.created", received);

        await expect(dispatcher.publish(createOrderCreatedEvent(order))).resolves.toBeUndefined();
        expect(received).toHaveBeenCalledWith(expect.objectContaining({ name: "order.created" }));
    });

    it("does not duplicate a subscriber registered more than once", async () => {
        const dispatcher = new DomainEventDispatcher();
        const consumer = vi.fn();

        dispatcher.subscribe("order.created", consumer);
        dispatcher.subscribe("order.created", consumer);

        await dispatcher.publish(createOrderCreatedEvent(order));

        expect(consumer).toHaveBeenCalledOnce();
    });
});
