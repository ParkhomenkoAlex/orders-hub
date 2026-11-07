import "server-only";

import { DomainEventDispatcher } from "./domain-event-dispatcher";
import { createOrderCreatedEvent } from "./domain-events";
import {
    createOrderCreatedAuditConsumer,
    createOrderCreatedMetrics,
} from "./order-created-consumers";
import type { Order } from "@/types/domain";

const dispatcher = new DomainEventDispatcher();
const orderCreatedMetrics = createOrderCreatedMetrics();

dispatcher.subscribe("order.created", createOrderCreatedAuditConsumer());
dispatcher.subscribe("order.created", orderCreatedMetrics.consume);

export const publishOrderCreated = async (order: Order) => {
    await dispatcher.publish(createOrderCreatedEvent(order));
};

export const getOrderCreatedMetrics = () => orderCreatedMetrics.getSnapshot();
