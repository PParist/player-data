/*
  Warnings:

  - You are about to drop the column `obtain_type` on the `obtain_bases` table. All the data in the column will be lost.
  - You are about to drop the column `type_uuid` on the `obtain_bases` table. All the data in the column will be lost.
  - You are about to drop the `character_customizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `custome_bases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "character_customizations" DROP CONSTRAINT "character_customizations_custome_base_uuid_fkey";

-- DropForeignKey
ALTER TABLE "character_customizations" DROP CONSTRAINT "character_customizations_obtain_uuid_fkey";

-- DropForeignKey
ALTER TABLE "character_customizations" DROP CONSTRAINT "character_customizations_player_uuid_fkey";

-- AlterTable
CREATE SEQUENCE obtain_bases_id_seq;
ALTER TABLE "obtain_bases" DROP COLUMN "obtain_type",
DROP COLUMN "type_uuid",
ADD COLUMN     "info" TEXT,
ADD COLUMN     "obtains_type" TEXT,
ADD COLUMN     "types_uuid" TEXT,
ALTER COLUMN "id" SET DEFAULT nextval('obtain_bases_id_seq'),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_by" DROP NOT NULL;
ALTER SEQUENCE obtain_bases_id_seq OWNED BY "obtain_bases"."id";

-- AlterTable
CREATE SEQUENCE player_profiles_id_seq;
ALTER TABLE "player_profiles" ALTER COLUMN "id" SET DEFAULT nextval('player_profiles_id_seq'),
ALTER COLUMN "user_account_uuid" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_by" DROP NOT NULL;
ALTER SEQUENCE player_profiles_id_seq OWNED BY "player_profiles"."id";

-- DropTable
DROP TABLE "character_customizations";

-- DropTable
DROP TABLE "custome_bases";

-- CreateTable
CREATE TABLE "costume_bases" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" TEXT,
    "obtains_base_uuid" TEXT,
    "image_path" TEXT,
    "prefab_path" TEXT,
    "equip_type" INTEGER NOT NULL,
    "model" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "is_active" INTEGER NOT NULL,
    "is_default" INTEGER NOT NULL,
    "is_colorable" INTEGER NOT NULL,
    "colors" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "costume_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costumes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "player_uuid" TEXT NOT NULL,
    "costume_base_uuid" TEXT NOT NULL,
    "current_color" TEXT,
    "obtain_date" TIMESTAMP(3) NOT NULL,
    "is_fashion" INTEGER NOT NULL,
    "is_active" INTEGER NOT NULL,
    "is_equipped" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "costumes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "costume_bases_uuid_key" ON "costume_bases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "costume_bases_equipment_id_key" ON "costume_bases"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "costumes_uuid_key" ON "costumes"("uuid");

-- AddForeignKey
ALTER TABLE "costume_bases" ADD CONSTRAINT "costume_bases_obtains_base_uuid_fkey" FOREIGN KEY ("obtains_base_uuid") REFERENCES "obtain_bases"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costumes" ADD CONSTRAINT "costumes_player_uuid_fkey" FOREIGN KEY ("player_uuid") REFERENCES "player_profiles"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costumes" ADD CONSTRAINT "costumes_costume_base_uuid_fkey" FOREIGN KEY ("costume_base_uuid") REFERENCES "costume_bases"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
