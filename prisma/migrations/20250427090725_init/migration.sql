-- CreateTable
CREATE TABLE "player_profiles" (
    "id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_account_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "level" INTEGER NOT NULL,
    "exp" INTEGER NOT NULL,
    "current_mana" INTEGER NOT NULL,
    "max_mana" INTEGER NOT NULL,
    "zeny" INTEGER NOT NULL,
    "crystal_shard" INTEGER NOT NULL,
    "golden_poring_coin" INTEGER NOT NULL,
    "poring_coin" INTEGER NOT NULL,
    "gachapon_ticket" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custome_bases" (
    "id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "info" TEXT,
    "image_url" TEXT,
    "prefab_url" TEXT,
    "model" INTEGER NOT NULL,
    "is_default" INTEGER NOT NULL,
    "is_colorable" INTEGER NOT NULL,
    "current_color" TEXT,
    "colors" TEXT,
    "equip_type" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "custome_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_customizations" (
    "id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "player_uuid" TEXT NOT NULL,
    "custome_base_uuid" TEXT NOT NULL,
    "obtain_uuid" TEXT NOT NULL,
    "obtain_date" TIMESTAMP(3) NOT NULL,
    "is_fashion" INTEGER NOT NULL,
    "is_active" INTEGER NOT NULL,
    "is_equiped" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "character_customizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obtain_bases" (
    "id" INTEGER NOT NULL,
    "uuid" TEXT NOT NULL,
    "obtain_type" TEXT NOT NULL,
    "type_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "version" INTEGER NOT NULL,

    CONSTRAINT "obtain_bases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_uuid_key" ON "player_profiles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_name_key" ON "player_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "custome_bases_uuid_key" ON "custome_bases"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "custome_bases_equipment_id_key" ON "custome_bases"("equipment_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_customizations_uuid_key" ON "character_customizations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "obtain_bases_uuid_key" ON "obtain_bases"("uuid");

-- AddForeignKey
ALTER TABLE "character_customizations" ADD CONSTRAINT "character_customizations_player_uuid_fkey" FOREIGN KEY ("player_uuid") REFERENCES "player_profiles"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_customizations" ADD CONSTRAINT "character_customizations_custome_base_uuid_fkey" FOREIGN KEY ("custome_base_uuid") REFERENCES "custome_bases"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_customizations" ADD CONSTRAINT "character_customizations_obtain_uuid_fkey" FOREIGN KEY ("obtain_uuid") REFERENCES "obtain_bases"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
