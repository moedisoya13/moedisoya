CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`datetime` integer NOT NULL,
	`duration` integer DEFAULT 60 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`notes` text,
	`location` text DEFAULT '정발' NOT NULL,
	`status` text DEFAULT '신규' NOT NULL,
	`type` text DEFAULT '-' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`reminder_enabled` integer DEFAULT true NOT NULL,
	`reminder_minutes` integer DEFAULT 60 NOT NULL,
	`daily_summary` integer DEFAULT true NOT NULL,
	`summary_time` text DEFAULT '08:00' NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_subscriptions_endpoint_unique` ON `push_subscriptions` (`endpoint`);