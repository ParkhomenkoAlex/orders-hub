import type { DomainEvent, DomainEventHandler, DomainEventName } from "./domain-events";

export class DomainEventDispatcher {
    private readonly subscribers = new Map<DomainEventName, Set<DomainEventHandler>>();

    subscribe(eventName: DomainEventName, handler: DomainEventHandler) {
        const handlers = this.subscribers.get(eventName) ?? new Set<DomainEventHandler>();
        handlers.add(handler);
        this.subscribers.set(eventName, handlers);

        return () => {
            handlers.delete(handler);
            if (!handlers.size) {
                this.subscribers.delete(eventName);
            }
        };
    }

    async publish(event: DomainEvent): Promise<void> {
        const handlers = [...(this.subscribers.get(event.name) ?? [])];

        await Promise.allSettled(
            handlers.map((handler) => Promise.resolve().then(() => handler(event))),
        );
    }
}
