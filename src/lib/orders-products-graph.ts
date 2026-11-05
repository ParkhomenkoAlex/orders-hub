import type { Order, Product } from "@/types/domain";

export type OrdersProductsGraphNodeKind = "order" | "product";

export interface OrdersProductsGraphNode {
    id: string;
    entityId: string;
    kind: OrdersProductsGraphNodeKind;
    label: string;
}

export interface OrdersProductsGraphEdge {
    id: string;
    source: string;
    target: string;
}

export interface OrdersProductsGraphData {
    nodes: OrdersProductsGraphNode[];
    edges: OrdersProductsGraphEdge[];
}

const getOrderNodeId = (orderId: string) => `order:${orderId}`;
const getProductNodeId = (productId: string) => `product:${productId}`;

export const buildOrdersProductsGraph = (
    orders: Order[],
    products: Product[],
): OrdersProductsGraphData => {
    const ordersById = new Map<string, Order>();
    const nodes = new Map<string, OrdersProductsGraphNode>();
    const edges = new Map<string, OrdersProductsGraphEdge>();

    for (const order of orders) {
        if (ordersById.has(order.id)) {
            continue;
        }

        const nodeId = getOrderNodeId(order.id);
        ordersById.set(order.id, order);
        nodes.set(nodeId, { id: nodeId, entityId: order.id, kind: "order", label: order.title });
    }

    for (const product of products) {
        const orderNodeId = getOrderNodeId(product.orderId);
        if (!ordersById.has(product.orderId)) {
            continue;
        }

        const productNodeId = getProductNodeId(product.id);
        if (!nodes.has(productNodeId)) {
            nodes.set(productNodeId, {
                id: productNodeId,
                entityId: product.id,
                kind: "product",
                label: product.title,
            });
        }

        const edgeId = `${orderNodeId}->${productNodeId}`;
        edges.set(edgeId, { id: edgeId, source: orderNodeId, target: productNodeId });
    }

    return { nodes: [...nodes.values()], edges: [...edges.values()] };
};

export const getRelatedGraphNodes = (
    graph: OrdersProductsGraphData,
    nodeId: string,
): OrdersProductsGraphNode[] => {
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));

    return graph.edges.flatMap((edge) => {
        const relatedNodeId =
            edge.source === nodeId ? edge.target : edge.target === nodeId ? edge.source : null;
        const relatedNode = relatedNodeId ? nodesById.get(relatedNodeId) : undefined;

        return relatedNode ? [relatedNode] : [];
    });
};

export const getGraphNode = (graph: OrdersProductsGraphData, nodeId: string | null) =>
    nodeId ? (graph.nodes.find((node) => node.id === nodeId) ?? null) : null;
