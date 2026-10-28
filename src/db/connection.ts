type TlsOptions = {
    ca: string;
    rejectUnauthorized: true;
};

type DrizzleCredentials =
    | { url: string }
    | {
          host: string;
          port: number;
          user: string;
          password: string;
          database: string;
          ssl: TlsOptions;
      };

export interface MySqlConnectionOptions {
    database: string;
    poolOptions: {
        uri: string;
        ssl?: TlsOptions;
    };
    drizzleCredentials: DrizzleCredentials;
    usesTls: boolean;
}

const decode = (value: string) => decodeURIComponent(value);

export const getMySqlConnectionOptions = (
    databaseUrl: string,
    databaseSslCa?: string,
    sslCaVariableName = "DATABASE_SSL_CA",
): MySqlConnectionOptions => {
    let connectionUrl: URL;
    try {
        connectionUrl = new URL(databaseUrl);
    } catch {
        throw new Error("DATABASE_URL must be a valid MySQL connection URL.");
    }

    if (connectionUrl.protocol !== "mysql:") {
        throw new Error("DATABASE_URL must use the mysql: protocol.");
    }

    const database = decode(connectionUrl.pathname.slice(1));
    if (!database) {
        throw new Error("DATABASE_URL must include a database name.");
    }

    const sslMode = connectionUrl.searchParams.get("ssl-mode");
    if (!sslMode) {
        if (connectionUrl.hostname.endsWith(".aivencloud.com")) {
            throw new Error("Aiven DATABASE_URL must use ssl-mode=REQUIRED.");
        }

        return {
            database,
            poolOptions: { uri: connectionUrl.toString() },
            drizzleCredentials: { url: connectionUrl.toString() },
            usesTls: false,
        };
    }

    if (sslMode !== "REQUIRED") {
        throw new Error(`Unsupported MySQL ssl-mode: ${sslMode}.`);
    }

    const ca = databaseSslCa?.replace(/\\n/g, "\n");
    if (!ca) {
        throw new Error(`${sslCaVariableName} is required when ssl-mode=REQUIRED.`);
    }

    connectionUrl.searchParams.delete("ssl-mode");
    const uri = connectionUrl.toString();
    const ssl: TlsOptions = { ca, rejectUnauthorized: true };

    return {
        database,
        poolOptions: { uri, ssl },
        drizzleCredentials: {
            host: connectionUrl.hostname,
            port: Number(connectionUrl.port) || 3306,
            user: decode(connectionUrl.username),
            password: decode(connectionUrl.password),
            database,
            ssl,
        },
        usesTls: true,
    };
};

export const getAivenMigrationConnectionOptions = (databaseUrl: string, databaseSslCa?: string) => {
    const connection = getMySqlConnectionOptions(
        databaseUrl,
        databaseSslCa,
        "AIVEN_DATABASE_SSL_CA",
    );

    if (!connection.usesTls) {
        throw new Error("AIVEN_DATABASE_URL must use ssl-mode=REQUIRED.");
    }

    if (connection.database !== "orders_hub") {
        throw new Error("AIVEN_DATABASE_URL must target the orders_hub database.");
    }

    return connection;
};
