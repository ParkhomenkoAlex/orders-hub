import { NextResponse } from "next/server";

export const success = <Data>(data: Data, status = 200) => NextResponse.json({ data }, { status });

export const failure = (
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>,
) => NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
