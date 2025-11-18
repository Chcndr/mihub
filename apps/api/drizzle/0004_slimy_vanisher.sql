CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stall_id` int NOT NULL,
	`user_id` int,
	`vendor_id` int,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`booking_date` timestamp NOT NULL,
	`expires_at` timestamp NOT NULL,
	`checked_in_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concession_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`concession_id` int NOT NULL,
	`vendor_id` int NOT NULL,
	`amount` int NOT NULL,
	`payment_method` varchar(50),
	`payment_reference` varchar(255),
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`paid_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `concession_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `concessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendor_id` int NOT NULL,
	`stall_id` int,
	`market_id` int NOT NULL,
	`concession_number` varchar(100) NOT NULL,
	`type` varchar(50) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`fee` int,
	`payment_status` varchar(50) DEFAULT 'pending',
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `concessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `concessions_concession_number_unique` UNIQUE(`concession_number`)
);
--> statement-breakpoint
CREATE TABLE `custom_areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`market_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`geojson` text NOT NULL,
	`color` varchar(20),
	`opacity` int DEFAULT 50,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_areas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_markers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`market_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100),
	`lat` varchar(20) NOT NULL,
	`lng` varchar(20) NOT NULL,
	`icon` varchar(100),
	`color` varchar(20),
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `custom_markers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inspections_detailed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendor_id` int NOT NULL,
	`stall_id` int,
	`inspector_name` varchar(255) NOT NULL,
	`inspector_badge` varchar(100),
	`type` varchar(100) NOT NULL,
	`checklist` text,
	`photos_urls` text,
	`gps_lat` varchar(20),
	`gps_lng` varchar(20),
	`result` varchar(50) NOT NULL,
	`notes` text,
	`signature_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inspections_detailed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `market_geometry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`market_id` int NOT NULL,
	`container_geojson` text,
	`center_lat` varchar(20) NOT NULL,
	`center_lng` varchar(20) NOT NULL,
	`hub_area_geojson` text,
	`market_area_geojson` text,
	`gcp_data` text,
	`png_url` text,
	`png_metadata` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `market_geometry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stalls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`market_id` int NOT NULL,
	`number` varchar(20) NOT NULL,
	`lat` varchar(20) NOT NULL,
	`lng` varchar(20) NOT NULL,
	`area_mq` int,
	`status` varchar(50) NOT NULL DEFAULT 'free',
	`category` varchar(100),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stalls_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendor_id` int NOT NULL,
	`type` varchar(100) NOT NULL,
	`document_number` varchar(100),
	`issue_date` timestamp,
	`expiry_date` timestamp,
	`file_url` text,
	`status` varchar(50) NOT NULL DEFAULT 'valid',
	`verified_by` varchar(255),
	`verified_at` timestamp,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendor_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_presences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendor_id` int NOT NULL,
	`stall_id` int NOT NULL,
	`booking_id` int,
	`checkin_time` timestamp NOT NULL,
	`checkout_time` timestamp,
	`duration` int,
	`lat` varchar(20),
	`lng` varchar(20),
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_presences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`fiscal_code` varchar(16),
	`vat_number` varchar(20),
	`business_name` varchar(255),
	`business_type` varchar(100),
	`ateco_code` varchar(20),
	`phone` varchar(50),
	`email` varchar(320),
	`address` text,
	`bank_account` varchar(100),
	`photo_url` text,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`rating` int DEFAULT 0,
	`total_sales` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendors_fiscal_code_unique` UNIQUE(`fiscal_code`),
	CONSTRAINT `vendors_vat_number_unique` UNIQUE(`vat_number`)
);
--> statement-breakpoint
CREATE TABLE `violations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inspection_id` int,
	`vendor_id` int NOT NULL,
	`stall_id` int,
	`violation_type` varchar(100) NOT NULL,
	`violation_code` varchar(50),
	`description` text NOT NULL,
	`fine_amount` int,
	`status` varchar(50) NOT NULL DEFAULT 'issued',
	`due_date` timestamp,
	`paid_at` timestamp,
	`payment_reference` varchar(255),
	`appeal_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `violations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_stall_id_stalls_id_fk` FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `concession_payments` ADD CONSTRAINT `concession_payments_concession_id_concessions_id_fk` FOREIGN KEY (`concession_id`) REFERENCES `concessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `concession_payments` ADD CONSTRAINT `concession_payments_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `concessions` ADD CONSTRAINT `concessions_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `concessions` ADD CONSTRAINT `concessions_stall_id_stalls_id_fk` FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `concessions` ADD CONSTRAINT `concessions_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_areas` ADD CONSTRAINT `custom_areas_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_markers` ADD CONSTRAINT `custom_markers_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspections_detailed` ADD CONSTRAINT `inspections_detailed_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inspections_detailed` ADD CONSTRAINT `inspections_detailed_stall_id_stalls_id_fk` FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `market_geometry` ADD CONSTRAINT `market_geometry_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stalls` ADD CONSTRAINT `stalls_market_id_markets_id_fk` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_documents` ADD CONSTRAINT `vendor_documents_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_presences` ADD CONSTRAINT `vendor_presences_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_presences` ADD CONSTRAINT `vendor_presences_stall_id_stalls_id_fk` FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_presences` ADD CONSTRAINT `vendor_presences_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `violations` ADD CONSTRAINT `violations_inspection_id_inspections_detailed_id_fk` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_detailed`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `violations` ADD CONSTRAINT `violations_vendor_id_vendors_id_fk` FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `violations` ADD CONSTRAINT `violations_stall_id_stalls_id_fk` FOREIGN KEY (`stall_id`) REFERENCES `stalls`(`id`) ON DELETE no action ON UPDATE no action;