"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n/I18nProvider";
import {
    buildOrdersProductsGraph,
    getGraphNode,
    getRelatedGraphNodes,
    type OrdersProductsGraphNode,
} from "@/lib/orders-products-graph";
import type { Order, Product } from "@/types/domain";
import styles from "./OrdersProductsGraph.module.scss";

interface OrdersProductsGraphProps {
    orders: Order[];
    products: Product[];
    isLoading?: boolean;
    isError?: boolean;
}

interface GraphNodePosition {
    x: number;
    y: number;
}

const GRAPH_WIDTH = 720;
const NODE_WIDTH = 210;
const NODE_HEIGHT = 46;
const ORDER_X = 35;
const PRODUCT_X = GRAPH_WIDTH - NODE_WIDTH - ORDER_X;
const NODE_GAP = 22;
const GRAPH_PADDING = 42;

const truncateLabel = (label: string) => (label.length > 24 ? `${label.slice(0, 23)}…` : label);

const getNodePosition = (index: number): GraphNodePosition => ({
    x: 0,
    y: GRAPH_PADDING + index * (NODE_HEIGHT + NODE_GAP),
});

export function OrdersProductsGraph({
    orders,
    products,
    isLoading = false,
    isError = false,
}: OrdersProductsGraphProps) {
    const { t } = useTranslation();
    const graph = useMemo(() => buildOrdersProductsGraph(orders, products), [orders, products]);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const selectedNode = getGraphNode(graph, selectedNodeId);
    const orderNodes = graph.nodes.filter((node) => node.kind === "order");
    const productNodes = graph.nodes.filter((node) => node.kind === "product");
    const maxNodeCount = Math.max(orderNodes.length, productNodes.length);
    const graphHeight = Math.max(
        230,
        GRAPH_PADDING * 2 + maxNodeCount * NODE_HEIGHT + Math.max(0, maxNodeCount - 1) * NODE_GAP,
    );
    const positions = new Map<string, GraphNodePosition>([
        ...orderNodes.map((node, index): [string, GraphNodePosition] => [
            node.id,
            { ...getNodePosition(index), x: ORDER_X },
        ]),
        ...productNodes.map((node, index): [string, GraphNodePosition] => [
            node.id,
            { ...getNodePosition(index), x: PRODUCT_X },
        ]),
    ]);

    if (isLoading) {
        return (
            <section className={styles.ordersGraph} aria-busy="true" aria-label={t.graph.loading}>
                <p className={styles.ordersGraph__message} role="status">
                    {t.graph.loading}
                </p>
            </section>
        );
    }

    if (isError) {
        return (
            <section className={styles.ordersGraph} aria-labelledby="orders-products-graph-title">
                <h2 id="orders-products-graph-title">{t.graph.title}</h2>
                <p className={styles.ordersGraph__message} role="status">
                    {t.graph.unavailable}
                </p>
            </section>
        );
    }

    if (!graph.edges.length) {
        return (
            <section className={styles.ordersGraph} aria-labelledby="orders-products-graph-title">
                <h2 id="orders-products-graph-title">{t.graph.title}</h2>
                <p className={styles.ordersGraph__message}>{t.graph.empty}</p>
            </section>
        );
    }

    const getNodeLabel = (node: OrdersProductsGraphNode) =>
        (node.kind === "order" ? t.graph.orderNode : t.graph.productNode).replace(
            "{title}",
            node.label,
        );
    const selectedRelations = selectedNode ? getRelatedGraphNodes(graph, selectedNode.id) : [];

    return (
        <section className={styles.ordersGraph} aria-labelledby="orders-products-graph-title">
            <header className={styles.ordersGraph__header}>
                <div>
                    <h2 id="orders-products-graph-title">{t.graph.title}</h2>
                    <p>{t.graph.description}</p>
                </div>
                <div className={styles.ordersGraph__legend} aria-hidden="true">
                    <span className={styles["ordersGraph__legendItem--order"]}>
                        {t.graph.orders}
                    </span>
                    <span className={styles["ordersGraph__legendItem--product"]}>
                        {t.graph.products}
                    </span>
                </div>
            </header>
            <div className={styles.ordersGraph__canvas}>
                <svg
                    className={styles.ordersGraph__svg}
                    viewBox={`0 0 ${GRAPH_WIDTH} ${graphHeight}`}
                    role="group"
                    aria-label={t.graph.title}
                >
                    {graph.edges.map((edge) => {
                        const source = positions.get(edge.source);
                        const target = positions.get(edge.target);

                        if (!source || !target) {
                            return null;
                        }

                        return (
                            <line
                                key={edge.id}
                                className={styles.ordersGraph__edge}
                                x1={source.x + NODE_WIDTH}
                                y1={source.y + NODE_HEIGHT / 2}
                                x2={target.x}
                                y2={target.y + NODE_HEIGHT / 2}
                            />
                        );
                    })}
                    {graph.nodes.map((node) => {
                        const position = positions.get(node.id);
                        const isSelected = selectedNode?.id === node.id;

                        if (!position) {
                            return null;
                        }

                        return (
                            <g
                                key={node.id}
                                className={`${styles.ordersGraph__node} ${
                                    node.kind === "order"
                                        ? styles["ordersGraph__node--order"]
                                        : styles["ordersGraph__node--product"]
                                } ${isSelected ? styles["ordersGraph__node--selected"] : ""}`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                aria-label={getNodeLabel(node)}
                                onClick={() => setSelectedNodeId(node.id)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        setSelectedNodeId(node.id);
                                    }
                                }}
                            >
                                <title>{getNodeLabel(node)}</title>
                                <rect
                                    x={position.x}
                                    y={position.y}
                                    width={NODE_WIDTH}
                                    height={NODE_HEIGHT}
                                    rx={5}
                                />
                                <text x={position.x + 12} y={position.y + 28}>
                                    {truncateLabel(node.label)}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className={styles.ordersGraph__details} aria-live="polite">
                {selectedNode ? (
                    <>
                        <h3>
                            {(selectedNode.kind === "order"
                                ? t.graph.selectedOrder
                                : t.graph.selectedProduct
                            ).replace("{title}", selectedNode.label)}
                        </h3>
                        {selectedRelations.length ? (
                            <>
                                <p>
                                    {(selectedNode.kind === "order"
                                        ? t.graph.relatedProducts
                                        : t.graph.relatedOrders
                                    ).replace("{count}", String(selectedRelations.length))}
                                </p>
                                <ul>
                                    {selectedRelations.map((node) => (
                                        <li key={node.id}>{node.label}</li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <p>
                                {selectedNode.kind === "order"
                                    ? t.graph.noRelatedProducts
                                    : t.graph.noRelatedOrders}
                            </p>
                        )}
                    </>
                ) : (
                    <p>{t.graph.description}</p>
                )}
            </div>
            <div className={styles.ordersGraph__relationships}>
                <h3>{t.graph.relationships}</h3>
                <ul>
                    {graph.edges.map((edge) => {
                        const order = getGraphNode(graph, edge.source);
                        const product = getGraphNode(graph, edge.target);

                        if (!order || !product) {
                            return null;
                        }

                        return (
                            <li key={edge.id}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedNodeId(product.id)}
                                    aria-label={t.graph.selectRelationship
                                        .replace("{order}", order.label)
                                        .replace("{product}", product.label)}
                                >
                                    {t.graph.relationship
                                        .replace("{order}", order.label)
                                        .replace("{product}", product.label)}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
