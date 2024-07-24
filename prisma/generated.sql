-- CreateTable
CREATE TABLE
  `Account` (
    `id` BINARY(16) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `role` ENUM ('USER', 'MANAGER', 'SUPERADMIN') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    UNIQUE INDEX `Account_email_key` (`email` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Cinema` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `provider_id` BINARY(16) NOT NULL,
    `manager_id` BINARY(16) NOT NULL,
    INDEX `Cinema_manager_id_fkey` (`manager_id` ASC),
    INDEX `Cinema_provider_id_fkey` (`provider_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `CinemaLayout` (
    `id` BINARY(16) NOT NULL,
    `type` ENUM ('RECTANGLE', 'DYNAMIC') NOT NULL,
    `data` TEXT NOT NULL,
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `CinemaProvider` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `CinemaRoom` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM ('NORMAL', 'VIP', 'DELUXE') NOT NULL,
    `cinema_id` BINARY(16) NOT NULL,
    `cinema_layout_id` BINARY(16) NOT NULL,
    INDEX `CinemaRoom_cinema_id_fkey` (`cinema_id` ASC),
    INDEX `CinemaRoom_cinema_layout_id_fkey` (`cinema_layout_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Comment` (
    `id` BINARY(16) NOT NULL,
    `dest_id` BINARY(16) NOT NULL,
    `body` VARCHAR(250) NOT NULL,
    `type` ENUM ('FILM', 'USER', 'COMMENT') NOT NULL,
    INDEX `Comment_dest_film_fkey` (`dest_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Film` (
    `id` BINARY(16) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `director` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `release_date` TIMESTAMP(0) NOT NULL,
    `country` VARCHAR(50) NOT NULL,
    `restrict_age` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NOT NULL,
    `picture_url` VARCHAR(2083) NOT NULL,
    `background_url` VARCHAR(2083) NOT NULL,
    `trailer_url` VARCHAR(2083) NOT NULL,
    `language` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Item` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `parent_id` BINARY(16) NULL,
    INDEX `Item_parent_id_fkey` (`parent_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `ManagerAccount` (
    `id` BINARY(16) NOT NULL,
    `account_id` BINARY(16) NOT NULL,
    UNIQUE INDEX `ManagerAccount_account_id_key` (`account_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Payment` (
    `id` BINARY(16) NOT NULL,
    `user_id` BINARY(16) NOT NULL,
    `perform_id` BINARY(16) NOT NULL,
    `date_created` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_expired` TIMESTAMP(0) NOT NULL,
    `status` ENUM ('PENDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    INDEX `Payment_perform_id_fkey` (`perform_id` ASC),
    UNIQUE INDEX `Payment_user_id_key` (`user_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Perform` (
    `id` BINARY(16) NOT NULL,
    `film_id` BINARY(16) NOT NULL,
    `cinema_room_id` BINARY(16) NOT NULL,
    `start_time` TIMESTAMP(0) NOT NULL,
    `end_time` TIMESTAMP(0) NOT NULL,
    `translate_type` ENUM ('SUBTITLE', 'DUBBING', 'NONE') NOT NULL DEFAULT 'NONE',
    `view_type` ENUM ('V2D', 'V3D', 'IMAX') NOT NULL DEFAULT 'V2D',
    `price` DOUBLE NOT NULL,
    INDEX `Perform_cinema_room_id_fkey` (`cinema_room_id` ASC),
    INDEX `Perform_film_id_fkey` (`film_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `PickSeat` (
    `id` BINARY(16) NOT NULL,
    `user_id` BINARY(16) NOT NULL,
    `perform_id` BINARY(16) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    -- INDEX `PickSeat_perform_id_fkey`(`perform_id` ASC),
    -- INDEX `PickSeat_user_id_fkey`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `Tag` (
    `id` BINARY(16) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `UserAccount` (
    `id` BINARY(16) NOT NULL,
    `account_id` BINARY(16) NOT NULL,
    UNIQUE INDEX `UserAccount_account_id_key` (`account_id` ASC),
    PRIMARY KEY (`id` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `_FilmToTag` (
    `A` BINARY(16) NOT NULL,
    `B` BINARY(16) NOT NULL,
    UNIQUE INDEX `_FilmToTag_AB_unique` (`A` ASC, `B` ASC),
    INDEX `_FilmToTag_B_index` (`B` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE
  `_ItemToPayment` (
    `A` BINARY(16) NOT NULL,
    `B` BINARY(16) NOT NULL,
    UNIQUE INDEX `_ItemToPayment_AB_unique` (`A` ASC, `B` ASC),
    INDEX `_ItemToPayment_B_index` (`B` ASC)
  ) DEFAULT CHARACTER
SET
  utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cinema` ADD CONSTRAINT `Cinema_manager_id_fkey` FOREIGN KEY (`manager_id`) REFERENCES `ManagerAccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cinema` ADD CONSTRAINT `Cinema_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `CinemaProvider` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CinemaRoom` ADD CONSTRAINT `CinemaRoom_cinema_id_fkey` FOREIGN KEY (`cinema_id`) REFERENCES `Cinema` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CinemaRoom` ADD CONSTRAINT `CinemaRoom_cinema_layout_id_fkey` FOREIGN KEY (`cinema_layout_id`) REFERENCES `CinemaLayout` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_dest_film_fkey` FOREIGN KEY (`dest_id`) REFERENCES `Film` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_dest_user_fkey` FOREIGN KEY (`dest_id`) REFERENCES `UserAccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Item` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ManagerAccount` ADD CONSTRAINT `ManagerAccount_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `Account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_perform_id_fkey` FOREIGN KEY (`perform_id`) REFERENCES `Perform` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `UserAccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perform` ADD CONSTRAINT `Perform_cinema_room_id_fkey` FOREIGN KEY (`cinema_room_id`) REFERENCES `CinemaRoom` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Perform` ADD CONSTRAINT `Perform_film_id_fkey` FOREIGN KEY (`film_id`) REFERENCES `Film` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickSeat` ADD CONSTRAINT `PickSeat_perform_id_fkey` FOREIGN KEY (`perform_id`) REFERENCES `Perform` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickSeat` ADD CONSTRAINT `PickSeat_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `UserAccount` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAccount` ADD CONSTRAINT `UserAccount_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `Account` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmToTag` ADD CONSTRAINT `_FilmToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Film` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_FilmToTag` ADD CONSTRAINT `_FilmToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToPayment` ADD CONSTRAINT `_ItemToPayment_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToPayment` ADD CONSTRAINT `_ItemToPayment_B_fkey` FOREIGN KEY (`B`) REFERENCES `Payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;