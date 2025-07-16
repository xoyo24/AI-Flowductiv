CREATE TABLE `activities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`duration_ms` integer NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`tags` text DEFAULT '[]',
	`priority` integer,
	`focus_rating` integer,
	`energy_level` text,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ai_summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`content` text NOT NULL,
	`provider` text NOT NULL,
	`activities_hash` text NOT NULL,
	`tokens_used` integer,
	`generated_at` integer NOT NULL,
	`user_id` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text,
	`avatar_url` text,
	`preferences` text DEFAULT '{}',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);