/*
  Warnings:

  - You are about to drop the `costume_bases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "costume_bases" DROP CONSTRAINT "costume_bases_obtains_base_uuid_fkey";

-- DropForeignKey
ALTER TABLE "costumes" DROP CONSTRAINT "costumes_costume_base_uuid_fkey";

-- DropTable
DROP TABLE "costume_bases";

-- CreateTable
CREATE TABLE "costume_basess" (
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

    CONSTRAINT "costume_basess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "costume_basess_uuid_key" ON "costume_basess"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "costume_basess_equipment_id_key" ON "costume_basess"("equipment_id");

-- AddForeignKey
ALTER TABLE "costume_basess" ADD CONSTRAINT "costume_basess_obtains_base_uuid_fkey" FOREIGN KEY ("obtains_base_uuid") REFERENCES "obtain_bases"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "costumes" ADD CONSTRAINT "costumes_costume_base_uuid_fkey" FOREIGN KEY ("costume_base_uuid") REFERENCES "costume_basess"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
