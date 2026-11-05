import "server-only";

import {
    GraphQLFloat,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
} from "graphql";
import { listOrders, listProducts } from "@/server/inventory";
import type { Order, Product } from "@/types/domain";

export interface GraphQLContext {
    getOrders: () => Promise<Order[]>;
    getProducts: () => Promise<Product[]>;
}

export const createGraphQLContext = (): GraphQLContext => {
    let orders: Promise<Order[]> | undefined;
    let products: Promise<Product[]> | undefined;

    return {
        getOrders: () => (orders ??= listOrders()),
        getProducts: () => (products ??= listProducts()),
    };
};

const warrantyType = new GraphQLObjectType<Product["warranty"]>({
    name: "Warranty",
    fields: {
        start: { type: new GraphQLNonNull(GraphQLString) },
        end: { type: new GraphQLNonNull(GraphQLString) },
    },
});

const priceType = new GraphQLObjectType<Product["price"]>({
    name: "Price",
    fields: {
        usd: { type: new GraphQLNonNull(GraphQLFloat) },
        uah: { type: new GraphQLNonNull(GraphQLFloat) },
    },
});

const productType = new GraphQLObjectType<Product>({
    name: "Product",
    fields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        orderId: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        serialNumber: { type: new GraphQLNonNull(GraphQLString) },
        type: { type: new GraphQLNonNull(GraphQLString) },
        status: { type: new GraphQLNonNull(GraphQLString) },
        condition: { type: new GraphQLNonNull(GraphQLString) },
        specification: { type: new GraphQLNonNull(GraphQLString) },
        groupName: { type: new GraphQLNonNull(GraphQLString) },
        ownerName: { type: GraphQLString },
        warranty: { type: new GraphQLNonNull(warrantyType) },
        price: { type: new GraphQLNonNull(priceType) },
    },
});

const orderType = new GraphQLObjectType<Order, GraphQLContext>({
    name: "Order",
    fields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        products: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(productType))),
            resolve: async (order, _arguments, context) =>
                (await context.getProducts()).filter((product) => product.orderId === order.id),
        },
    },
});

const queryType = new GraphQLObjectType<unknown, GraphQLContext>({
    name: "Query",
    fields: {
        orders: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(orderType))),
            resolve: (_source, _arguments, context) => context.getOrders(),
        },
        order: {
            type: orderType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (_source, { id }, context) =>
                (await context.getOrders()).find((order) => order.id === id) ?? null,
        },
        products: {
            type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(productType))),
            resolve: (_source, _arguments, context) => context.getProducts(),
        },
        product: {
            type: productType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: async (_source, { id }, context) =>
                (await context.getProducts()).find((product) => product.id === id) ?? null,
        },
    },
});

export const graphqlSchema = new GraphQLSchema({ query: queryType });
