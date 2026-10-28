# Database schema artifact

[`schema.sql`](./schema.sql) is a MySQL 8.4 DDL export of the implemented Orders Hub domain schema. It is the MySQL Workbench-compatible schema deliverable for this project.

It contains the `orders` and `products` tables only. It deliberately does not include Drizzle's `__drizzle_migrations` bookkeeping table or any application data.

## Source of truth

Drizzle remains the source of truth for database changes:

- TypeScript schema: [`../src/db/schema.ts`](../src/db/schema.ts)
- Versioned migrations: [`../drizzle/`](../drizzle/)

`schema.sql` is an exported review/import artifact. Do not edit it as a substitute for updating the Drizzle schema and generating a migration.

## Structure

`orders` has a UUID-compatible `char(36)` primary key, title, order date, and creation/update timestamps.

`products` has its own `char(36)` primary key and an `order_id` foreign key to `orders.id`. This is a one-to-many relationship: one order can have many products, and every product belongs to one order.

Deleting an order cascades through `products_order_id_orders_id_fk`, so its related products are deleted by MySQL. The export also includes:

- Product indexes on `order_id`, `product_type`, `product_status`, and `serial_number`.
- Enum constraints for product type, status, and condition.
- `DECIMAL(14,2)` USD and UAH prices with non-negative CHECK constraints.
- A CHECK constraint requiring `warranty_end` to be on or after `warranty_start`.
- InnoDB, `utf8mb4`, and `utf8mb4_0900_ai_ci`, matching the exported local MySQL 8.4 structure.

## Open in MySQL Workbench 26.10

1. Open MySQL Workbench 26.10 and connect to a MySQL 8.4 server.
2. Use **File → Open SQL Script** and select `database/schema.sql`.
3. Review the DDL in the SQL editor. Opening the file only displays the export; it does not create a database or execute any SQL.

## Verified local execution and inspection workflow

The following workflow was verified with the local Docker MySQL service (`mysql`) and MySQL Workbench 26.10. Run these commands from the repository root.

> [!WARNING]
> Execute this export only against a newly created, empty temporary database. Never run it against the local `orders_hub` database, the remote Aiven database, or any database that contains application data.

1. Create a temporary database:

    ```sh
    docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE orders_hub_schema_test"'
    ```

2. Execute the export with the MySQL CLI:

    ```sh
    docker compose exec -T mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" orders_hub_schema_test' < database/schema.sql
    ```

3. In MySQL Workbench, use a separate root connection to inspect `orders_hub_schema_test`. Refresh the Schemas navigator and confirm the `orders` and `products` tables and the `products_order_id_orders_id_fk` foreign key.
4. Drop the temporary database when inspection is complete:

    ```sh
    docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE orders_hub_schema_test"'
    ```

This repository does not include a native `.mwb` model file or an EER diagram.

## Regenerate after a schema change

After changing the Drizzle schema, generate and apply the corresponding migration to the intended local MySQL database first. Then replace this artifact with a no-data export of the two domain tables:

```bash
mysqldump --no-data --host=127.0.0.1 --port=3307 --user=orders_hub_app --password orders_hub orders products > database/schema.sql
```

`mysqldump` prompts for the password. Use the actual local host, port, user, and database values if they differ from `.env.example`. Review the regenerated DDL against `src/db/schema.ts` and the committed migration before committing it.

For the Aiven Preview database, apply migrations only through the documented manual Aiven migration flow. Do not use the local export command against Aiven unless the remote schema is intentionally being audited.
