/*
  Warnings:

  - You are about to drop the column `gachapon_ticket` on the `player_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `golden_poring_coin` on the `player_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `player_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `poring_coin` on the `player_profiles` table. All the data in the column will be lost.
  - Changed the type of `version` on the `costume_bases` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `costumes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `obtain_bases` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `version` on the `player_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "costume_bases" DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "costumes" DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "obtain_bases" DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "player_profiles" DROP COLUMN "gachapon_ticket",
DROP COLUMN "golden_poring_coin",
DROP COLUMN "image_url",
DROP COLUMN "poring_coin",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "frame_url" TEXT,
DROP COLUMN "version",
ADD COLUMN     "version" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "avatar_bases" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "obtains_base_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "avatar_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame_bases" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "obtains_base_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "frame_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "info" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_bases" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "level_max" INTEGER NOT NULL,
    "stat" TEXT NOT NULL,
    "skill_point" INTEGER NOT NULL,
    "zeny_spend" INTEGER NOT NULL,
    "image_parth" TEXT,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "is_active" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "talent_bases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avatar_bases_uuid_key" ON "avatar_bases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "frame_bases_uuid_key" ON "frame_bases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "announcements_uuid_key" ON "announcements"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "talent_bases_uuid_key" ON "talent_bases"("uuid");

-- AddForeignKey
ALTER TABLE "avatar_bases" ADD CONSTRAINT "avatar_bases_obtains_base_uuid_fkey" FOREIGN KEY ("obtains_base_uuid") REFERENCES "obtain_bases"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame_bases" ADD CONSTRAINT "frame_bases_obtains_base_uuid_fkey" FOREIGN KEY ("obtains_base_uuid") REFERENCES "obtain_bases"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
