import { graphql, type GraphQLError, type GraphQLFormattedError } from "graphql";
import { NextResponse } from "next/server";
import { createGraphQLContext, graphqlSchema } from "@/graphql/schema";

interface GraphQLRequestBody {
    query?: unknown;
    variables?: unknown;
    operationName?: unknown;
}

const graphqlErrorResponse = (status: number, message: string) =>
    NextResponse.json({ errors: [{ message }] }, { status });

const isVariablesObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const formatError = (error: GraphQLError): GraphQLFormattedError => {
    if (error.originalError) {
        return {
            message: "Unable to execute the GraphQL request.",
            ...(error.path ? { path: error.path } : {}),
        };
    }

    return {
        message: error.message,
        ...(error.locations ? { locations: error.locations } : {}),
        ...(error.path ? { path: error.path } : {}),
    };
};

export async function POST(request: Request) {
    if (!request.headers.get("content-type")?.includes("application/json")) {
        return graphqlErrorResponse(415, "Content-Type must be application/json.");
    }

    let body: GraphQLRequestBody;
    try {
        body = (await request.json()) as GraphQLRequestBody;
    } catch {
        return graphqlErrorResponse(400, "Request body must be valid JSON.");
    }

    if (!body || typeof body !== "object" || typeof body.query !== "string" || !body.query.trim()) {
        return graphqlErrorResponse(400, "Request body must include a GraphQL query.");
    }

    if (body.variables !== undefined && !isVariablesObject(body.variables)) {
        return graphqlErrorResponse(400, "GraphQL variables must be an object.");
    }

    if (
        body.operationName !== undefined &&
        body.operationName !== null &&
        typeof body.operationName !== "string"
    ) {
        return graphqlErrorResponse(400, "GraphQL operationName must be a string.");
    }

    try {
        const result = await graphql({
            schema: graphqlSchema,
            source: body.query,
            variableValues: body.variables,
            operationName: body.operationName ?? undefined,
            contextValue: createGraphQLContext(),
        });

        return NextResponse.json({
            ...(result.data !== undefined ? { data: result.data } : {}),
            ...(result.errors ? { errors: result.errors.map(formatError) } : {}),
        });
    } catch (error) {
        console.error("GraphQL API POST failed", {
            name: error instanceof Error ? error.name : "UnknownError",
        });
        return graphqlErrorResponse(500, "Unable to execute the GraphQL request.");
    }
}
