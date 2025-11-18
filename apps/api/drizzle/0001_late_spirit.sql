CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_email` varchar(255),
	`action` varchar(255) NOT NULL,
	`entity_type` varchar(100),
	`entity_id` int,
	`old_value` text,
	`new_value` text,
	`ip_address` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carbon_credits_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`base_value` int NOT NULL,
	`area_boosts` text,
	`category_boosts` text,
	`updated_by` varchar(255),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carbon_credits_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carbon_footprint` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`lifecycle_co2` int,
	`transport_co2` int,
	`packaging_co2` int,
	`total_co2` int,
	`calculated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `carbon_footprint_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`market_id` int,
	`transport` varchar(50),
	`lat` varchar(20),
	`lng` varchar(20),
	`carbon_saved` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `civic_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`type` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`lat` varchar(20),
	`lng` varchar(20),
	`photo_url` text,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `civic_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecocredits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`tcc_converted` int NOT NULL,
	`ecocredit_amount` int NOT NULL,
	`tpas_fund_id` varchar(255),
	`conversion_rate` int NOT NULL,
	`converted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecocredits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extended_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`wallet_balance` int NOT NULL DEFAULT 0,
	`sustainability_rating` int DEFAULT 0,
	`transport_preference` varchar(50),
	`phone` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `extended_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fund_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`source` varchar(255) NOT NULL,
	`amount` int NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fund_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `markets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`lat` varchar(20) NOT NULL,
	`lng` varchar(20) NOT NULL,
	`opening_hours` text,
	`active` int NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `markets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`product_id` int,
	`tpass_id` varchar(255),
	`origin_country` varchar(3),
	`origin_city` varchar(255),
	`transport_mode` varchar(50),
	`distance_km` int,
	`co2_kg` int,
	`dpp_hash` varchar(255),
	`customs_cleared` int NOT NULL DEFAULT 0,
	`iva_verified` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_tracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_tracking_tpass_id_unique` UNIQUE(`tpass_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shop_id` int,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`certifications` text,
	`price` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reimbursements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shop_id` int,
	`credits` int NOT NULL,
	`euros` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`batch_id` varchar(100),
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reimbursements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`market_id` int,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`certifications` text,
	`pending_reimbursement` int NOT NULL DEFAULT 0,
	`total_reimbursed` int NOT NULL DEFAULT 0,
	`bank_account` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`app` varchar(100) NOT NULL,
	`level` varchar(50) NOT NULL,
	`type` varchar(100),
	`message` text NOT NULL,
	`user_email` varchar(255),
	`ip_address` varchar(50),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`shop_id` int,
	`type` varchar(50) NOT NULL,
	`amount` int NOT NULL,
	`euro_value` int,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `carbon_footprint` ADD CONSTRAINT `carbon_footprint_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `civic_reports` ADD CONSTRAINT `civic_reports_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecocredits` ADD CONSTRAINT `ecocredits_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `extended_users` ADD CONSTRAINT `extended_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_tracking` ADD CONSTRAINT `product_tracking_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reimbursements` ADD CONSTRAINT `reimbursements_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shops` ADD CONSTRAINT `shops_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_shop_id_shops_id_fk` FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`) ON DELETE no action ON UPDATE no action;