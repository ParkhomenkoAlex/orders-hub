CREATE TABLE `orders` (
	`id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`order_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` char(36) NOT NULL,
	`order_id` char(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`serial_number` varchar(128) NOT NULL,
	`product_type` enum('Monitors','Laptops','Motherboards','Accessories') NOT NULL,
	`product_status` enum('Available','In service','Reserved') NOT NULL,
	`product_condition` enum('New','Used') NOT NULL,
	`specification` varchar(255) NOT NULL,
	`group_name` varchar(255) NOT NULL,
	`owner_name` varchar(255),
	`warranty_start` date NOT NULL,
	`warranty_end` date NOT NULL,
	`price_usd` decimal(14,2) NOT NULL,
	`price_uah` decimal(14,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_warranty_range_check` CHECK(`warranty_end` >= `warranty_start`),
	CONSTRAINT `products_price_usd_check` CHECK(`price_usd` >= 0),
	CONSTRAINT `products_price_uah_check` CHECK(`price_uah` >= 0)
);
--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `products_order_id_idx` ON `products` (`order_id`);--> statement-breakpoint
CREATE INDEX `products_type_idx` ON `products` (`product_type`);--> statement-breakpoint
CREATE INDEX `products_status_idx` ON `products` (`product_status`);--> statement-breakpoint
CREATE INDEX `products_serial_number_idx` ON `products` (`serial_number`);
