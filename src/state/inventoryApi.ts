import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Order, Product, ProductCondition, ProductStatus, ProductType } from "@/types/domain";

interface ApiResponse<Data> {
    data: Data;
}

export interface CreateProductRequest {
    orderId: string;
    title: string;
    serialNumber: string;
    type: ProductType;
    status: ProductStatus;
    condition?: ProductCondition;
    specification?: string;
    groupName?: string;
    ownerName?: string;
    warranty: Product["warranty"];
    price: Product["price"];
}

export const inventoryApi = createApi({
    reducerPath: "inventoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: typeof window === "undefined" ? "http://localhost/api" : "/api",
    }),
    tagTypes: ["Orders", "Products"],
    endpoints: (builder) => ({
        getOrders: builder.query<Order[], void>({
            query: () => "/orders",
            transformResponse: (response: ApiResponse<Order[]>) => response.data,
            providesTags: (orders) => [
                ...(orders?.map((order) => ({ type: "Orders" as const, id: order.id })) ?? []),
                { type: "Orders", id: "LIST" },
            ],
        }),
        getProducts: builder.query<Product[], void>({
            query: () => "/products",
            transformResponse: (response: ApiResponse<Product[]>) => response.data,
            providesTags: (products) => [
                ...(products?.map((product) => ({ type: "Products" as const, id: product.id })) ??
                    []),
                { type: "Products", id: "LIST" },
            ],
        }),
        createOrder: builder.mutation<Order, Pick<Order, "title">>({
            query: (body) => ({ url: "/orders", method: "POST", body }),
            transformResponse: (response: ApiResponse<Order>) => response.data,
            invalidatesTags: [{ type: "Orders", id: "LIST" }],
        }),
        deleteOrder: builder.mutation<{ id: string }, string>({
            query: (orderId) => ({ url: `/orders/${orderId}`, method: "DELETE" }),
            transformResponse: (response: ApiResponse<{ id: string }>) => response.data,
            invalidatesTags: (_result, _error, orderId) => [
                { type: "Orders", id: orderId },
                { type: "Orders", id: "LIST" },
                { type: "Products", id: "LIST" },
            ],
        }),
        createProduct: builder.mutation<Product, CreateProductRequest>({
            query: (body) => ({ url: "/products", method: "POST", body }),
            transformResponse: (response: ApiResponse<Product>) => response.data,
            invalidatesTags: [
                { type: "Products", id: "LIST" },
                { type: "Orders", id: "LIST" },
            ],
        }),
        deleteProduct: builder.mutation<{ id: string }, string>({
            query: (productId) => ({ url: `/products/${productId}`, method: "DELETE" }),
            transformResponse: (response: ApiResponse<{ id: string }>) => response.data,
            invalidatesTags: (_result, _error, productId) => [
                { type: "Products", id: productId },
                { type: "Products", id: "LIST" },
                { type: "Orders", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useCreateProductMutation,
    useDeleteOrderMutation,
    useDeleteProductMutation,
    useGetOrdersQuery,
    useGetProductsQuery,
} = inventoryApi;
