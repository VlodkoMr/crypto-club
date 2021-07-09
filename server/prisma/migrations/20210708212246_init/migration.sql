-- CreateTable
CREATE TABLE `rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `symbol` VARCHAR(255) NOT NULL,
    `price_usd` FLOAT NOT NULL DEFAULT 0,
    `price_pct` FLOAT NOT NULL DEFAULT 0,

    UNIQUE INDEX `rooms.symbol_unique`(`symbol`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `round_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `round_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `price_usd` FLOAT NOT NULL,

    INDEX `room_id`(`room_id`),
    INDEX `round_id`(`round_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rounds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `start_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `end_time` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `amount_wei` BIGINT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `hash` VARCHAR(255),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_predictions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `round_id` INTEGER NOT NULL,
    `is_winner` BOOLEAN,
    `prediction_usd` FLOAT NOT NULL,
    `entry_wei` BIGINT NOT NULL,

    INDEX `room_id`(`room_id`),
    INDEX `round_id`(`round_id`),
    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `address` VARCHAR(255) NOT NULL,
    `balance_wei` BIGINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users.address_unique`(`address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `round_results` ADD FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `round_results` ADD FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_payments` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_predictions` ADD FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_predictions` ADD FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_predictions` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
