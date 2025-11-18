CREATE TABLE `business_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int,
	`business_name` varchar(255) NOT NULL,
	`category` varchar(100),
	`total_sales` int NOT NULL DEFAULT 0,
	`total_credits` int NOT NULL DEFAULT 0,
	`total_revenue` int NOT NULL DEFAULT 0,
	`rating` int DEFAULT 0,
	`is_active` tinyint DEFAULT 1,
	`last_sale_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`business_id` int,
	`business_name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`inspector` varchar(255),
	`status` varchar(50) NOT NULL,
	`scheduled_date` timestamp,
	`completed_date` timestamp,
	`violation_found` tinyint DEFAULT 0,
	`fine_amount` int,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL,
	`target_users` text,
	`sent` int NOT NULL DEFAULT 0,
	`delivered` int NOT NULL DEFAULT 0,
	`opened` int NOT NULL DEFAULT 0,
	`clicked` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sustainability_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`population_rating` int NOT NULL,
	`total_co2_saved` int NOT NULL,
	`local_purchases` int NOT NULL,
	`ecommerce_purchases` int NOT NULL,
	`avg_co2_local` int NOT NULL,
	`avg_co2_ecommerce` int NOT NULL,
	CONSTRAINT `sustainability_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`transport` varchar(50),
	`origin` varchar(255),
	`sustainability_rating` int,
	`co2_saved` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_analytics` ADD CONSTRAINT `user_analytics_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;