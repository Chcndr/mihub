CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`environment` varchar(50) NOT NULL DEFAULT 'production',
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`permissions` text,
	`rate_limit` int NOT NULL DEFAULT 1000,
	`last_used_at` timestamp,
	`last_used_ip` varchar(50),
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `api_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`api_key_id` int,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`status_code` int NOT NULL,
	`response_time` int NOT NULL,
	`ip_address` varchar(50),
	`user_agent` text,
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `external_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`endpoint` varchar(500),
	`status` varchar(50) NOT NULL DEFAULT 'disconnected',
	`last_check_at` timestamp,
	`last_sync_at` timestamp,
	`last_error` text,
	`health_check_interval` int NOT NULL DEFAULT 300,
	`config` text,
	`features` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `external_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhook_id` int NOT NULL,
	`event` varchar(100) NOT NULL,
	`payload` text NOT NULL,
	`status_code` int,
	`response_body` text,
	`response_time` int,
	`success` int NOT NULL DEFAULT 0,
	`error_message` text,
	`retry_count` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`events` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`secret` varchar(255),
	`headers` text,
	`retry_policy` text,
	`last_triggered_at` timestamp,
	`success_count` int NOT NULL DEFAULT 0,
	`failure_count` int NOT NULL DEFAULT 0,
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `api_metrics` ADD CONSTRAINT `api_metrics_api_key_id_api_keys_id_fk` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_logs` ADD CONSTRAINT `webhook_logs_webhook_id_webhooks_id_fk` FOREIGN KEY (`webhook_id`) REFERENCES `webhooks`(`id`) ON DELETE no action ON UPDATE no action;