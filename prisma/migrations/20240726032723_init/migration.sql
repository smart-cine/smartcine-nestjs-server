-- CreateTable
CREATE TABLE `account` (
    `id` BINARY(16) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `role` ENUM('USER', 'MANAGER', 'SUPERADMIN') NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `account_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `useraccount` (
    `id` BINARY(16) NOT NULL,

    UNIQUE INDEX `useraccount_id_key`(`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `manageraccount` (
    `id` BINARY(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `id` BINARY(16) NOT NULL,
    `parent_id` BINARY(16) NULL,
    `manager_id` BINARY(16) NOT NULL,
    `cinema_provider_id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `amount` FLOAT NOT NULL,
    `discount` FLOAT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `name` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `film` (
    `id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,
    `cinema_provider_id` BINARY(16) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `director` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `release_date` TIMESTAMP(0) NOT NULL,
    `country` VARCHAR(50) NOT NULL,
    `restrict_age` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `duration` SMALLINT UNSIGNED NOT NULL,
    `picture_url` VARCHAR(2083) NOT NULL,
    `background_url` VARCHAR(2083) NOT NULL,
    `trailer_url` VARCHAR(2083) NOT NULL,
    `language` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pickseat` (
    `id` BINARY(16) NOT NULL,
    `account_id` BINARY(16) NOT NULL,
    `perform_id` BINARY(16) NOT NULL,
    `code` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `pickseat_account_id_perform_id_code_key`(`account_id`, `perform_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perform` (
    `id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,
    `film_id` BINARY(16) NOT NULL,
    `cinema_room_id` BINARY(16) NOT NULL,
    `start_time` TIMESTAMP(0) NOT NULL,
    `end_time` TIMESTAMP(0) NOT NULL,
    `translate_type` ENUM('SUBTITLE', 'DUBBING', 'NONE') NOT NULL DEFAULT 'NONE',
    `view_type` ENUM('V2D', 'V3D', 'IMAX') NOT NULL DEFAULT 'V2D',
    `price` FLOAT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment` (
    `id` BINARY(16) NOT NULL,
    `account_id` BINARY(16) NOT NULL,
    `perform_id` BINARY(16) NOT NULL,
    `date_created` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_expired` TIMESTAMP(0) NOT NULL,
    `status` ENUM('PENDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `payment_account_id_key`(`account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinemaprovider` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `logo_url` VARCHAR(2083) NOT NULL,
    `background_url` VARCHAR(2083) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinema` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `provider_id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,
    `address` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinemaroom` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('NORMAL', 'VIP', 'DELUXE') NOT NULL,
    `cinema_id` BINARY(16) NOT NULL,
    `cinema_layout_id` BINARY(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cinemalayout` (
    `id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,
    `type` ENUM('RECTANGLE', 'DYNAMIC') NOT NULL,
    `data` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` BINARY(16) NOT NULL,
    `parent_id` BINARY(16) NULL,
    `account_id` BINARY(16) NOT NULL,
    `dest_id` BINARY(16) NOT NULL,
    `body` VARCHAR(300) NOT NULL,
    `type` ENUM('FILM', 'ACCOUNT', 'COMMENT') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rating` (
    `id` BINARY(16) NOT NULL,
    `account_id` BINARY(16) NOT NULL,
    `dest_id` BINARY(16) NOT NULL,
    `type` ENUM('FILM', 'CINEMA', 'COMMENT') NOT NULL,
    `score` FLOAT NOT NULL,

    UNIQUE INDEX `rating_account_id_dest_id_key`(`account_id`, `dest_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_film_tag` (
    `film_id` BINARY(16) NOT NULL,
    `tag_id` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`film_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_item_payment` (
    `item_id` BINARY(16) NOT NULL,
    `payment_id` BINARY(16) NOT NULL,

    PRIMARY KEY (`item_id`, `payment_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_cinema_manager` (
    `cinema_id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,

    PRIMARY KEY (`cinema_id`, `manager_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `useraccount` ADD CONSTRAINT `useraccount_id_fkey` FOREIGN KEY (`id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `manageraccount` ADD CONSTRAINT `manageraccount_id_fkey` FOREIGN KEY (`id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `item`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `manageraccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_cinema_provider_id_fkey` FOREIGN KEY (`cinema_provider_id`) REFERENCES `cinemaprovider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `film` ADD CONSTRAINT `film_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `manageraccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `film` ADD CONSTRAINT `film_cinema_provider_id_fkey` FOREIGN KEY (`cinema_provider_id`) REFERENCES `cinemaprovider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickseat` ADD CONSTRAINT `pickseat_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pickseat` ADD CONSTRAINT `pickseat_perform_id_fkey` FOREIGN KEY (`perform_id`) REFERENCES `perform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perform` ADD CONSTRAINT `perform_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `manageraccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perform` ADD CONSTRAINT `perform_film_id_fkey` FOREIGN KEY (`film_id`) REFERENCES `film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perform` ADD CONSTRAINT `perform_cinema_room_id_fkey` FOREIGN KEY (`cinema_room_id`) REFERENCES `cinemaroom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment` ADD CONSTRAINT `payment_perform_id_fkey` FOREIGN KEY (`perform_id`) REFERENCES `perform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cinema` ADD CONSTRAINT `cinema_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `cinemaprovider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cinemaroom` ADD CONSTRAINT `cinemaroom_cinema_id_fkey` FOREIGN KEY (`cinema_id`) REFERENCES `cinema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cinemaroom` ADD CONSTRAINT `cinemaroom_cinema_layout_id_fkey` FOREIGN KEY (`cinema_layout_id`) REFERENCES `cinemalayout`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cinemalayout` ADD CONSTRAINT `cinemalayout_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `manageraccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_dest_id_fkey` FOREIGN KEY (`dest_id`) REFERENCES `comment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_dest_cinema_provider_fkey` FOREIGN KEY (`dest_id`) REFERENCES `cinemaprovider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_dest_film_fkey` FOREIGN KEY (`dest_id`) REFERENCES `film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `rating_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `Rating_dest_cinema_provider_fkey` FOREIGN KEY (`dest_id`) REFERENCES `cinemaprovider`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `Rating_dest_film_fkey` FOREIGN KEY (`dest_id`) REFERENCES `film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rating` ADD CONSTRAINT `Rating_dest_comment_fkey` FOREIGN KEY (`dest_id`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_film_tag` ADD CONSTRAINT `_film_tag_film_id_fkey` FOREIGN KEY (`film_id`) REFERENCES `film`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_film_tag` ADD CONSTRAINT `_film_tag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_item_payment` ADD CONSTRAINT `_item_payment_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_item_payment` ADD CONSTRAINT `_item_payment_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_cinema_manager` ADD CONSTRAINT `_cinema_manager_cinema_id_fkey` FOREIGN KEY (`cinema_id`) REFERENCES `cinema`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_cinema_manager` ADD CONSTRAINT `_cinema_manager_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `manageraccount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
