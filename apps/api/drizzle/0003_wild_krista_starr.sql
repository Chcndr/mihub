CREATE TABLE `mobility_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(50) NOT NULL,
	`line_number` varchar(20),
	`line_name` varchar(255),
	`stop_name` varchar(255),
	`lat` varchar(20),
	`lng` varchar(20),
	`status` varchar(50) DEFAULT 'active',
	`occupancy` int,
	`available_spots` int,
	`total_spots` int,
	`next_arrival` int,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mobility_data_id` PRIMARY KEY(`id`)
);
