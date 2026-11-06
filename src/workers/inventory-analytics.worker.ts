import {
    handleInventoryAnalyticsWorkerRequest,
    type InventoryAnalyticsWorkerRequest,
} from "@/lib/inventory-analytics";

const workerScope = self as unknown as {
    onmessage: ((event: MessageEvent<InventoryAnalyticsWorkerRequest>) => void) | null;
    postMessage: (message: ReturnType<typeof handleInventoryAnalyticsWorkerRequest>) => void;
};

workerScope.onmessage = (event) => {
    workerScope.postMessage(handleInventoryAnalyticsWorkerRequest(event.data));
};
