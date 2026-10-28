import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

import { getMySqlConnectionOptions } from "./connection";
import * as schema from "./schema";

const createDb = () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
    }

    const { poolOptions } = getMySqlConnectionOptions(databaseUrl, process.env.DATABASE_SSL_CA);
    const pool = mysql.createPool(poolOptions);

    return drizzle({
        client: pool,
        mode: "default",
        schema,
    });
};

let db: ReturnType<typeof createDb> | undefined;

export const getDb = () => {
    if (!db) {
        db = createDb();
    }

    return db;
};
