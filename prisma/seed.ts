import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data to avoid conflicts
  await prisma.characterCustomization.deleteMany();
  await prisma.obtainBase.deleteMany();
  await prisma.customeBase.deleteMany();
  await prisma.playerProfile.deleteMany();

  console.log('Seeding...');

  // Create ObtainBase records
  const gacha = await prisma.obtainBase.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440100',
      obtainType: 'GACHA',
      typeUuid: '550e8400-e29b-41d4-a716-446655440101',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const shop = await prisma.obtainBase.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440102',
      obtainType: 'SHOP',
      typeUuid: '550e8400-e29b-41d4-a716-446655440103',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const quest = await prisma.obtainBase.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440104',
      obtainType: 'QUEST',
      typeUuid: '550e8400-e29b-41d4-a716-446655440105',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  console.log('Created obtain bases:', { gacha, shop, quest });

  // Create CustomeBases
  const hat = await prisma.customeBase.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440200',
      equipmentId: 'EQ_HAT_001',
      name: 'Poring Hat',
      info: 'A cute hat that resembles a Poring',
      imageUrl: 'https://assets.game.com/items/poring_hat.png',
      prefabUrl: 'https://assets.game.com/prefabs/poring_hat.prefab',
      model: 1,
      isDefault: 0,
      isColorable: 1,
      currentColor: '#FF5733',
      colors: '["#FF5733", "#33FF57", "#3357FF"]',
      equipType: 1, // Hat
      tier: 3,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const armor = await prisma.customeBase.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440201',
      equipmentId: 'EQ_ARMOR_001',
      name: 'Novice Armor',
      info: 'Standard armor for beginners',
      imageUrl: 'https://assets.game.com/items/novice_armor.png',
      prefabUrl: 'https://assets.game.com/prefabs/novice_armor.prefab',
      model: 2,
      isDefault: 1,
      isColorable: 0,
      currentColor: null,
      colors: null,
      equipType: 2, // Armor
      tier: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const weapon = await prisma.customeBase.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440202',
      equipmentId: 'EQ_WEAPON_001',
      name: 'Magic Staff',
      info: 'A powerful staff infused with magical energy',
      imageUrl: 'https://assets.game.com/items/magic_staff.png',
      prefabUrl: 'https://assets.game.com/prefabs/magic_staff.prefab',
      model: 3,
      isDefault: 0,
      isColorable: 1,
      currentColor: '#5733FF',
      colors: '["#5733FF", "#33FF57", "#FF5733"]',
      equipType: 3, // Weapon
      tier: 4,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  console.log('Created custome bases:', { hat, armor, weapon });

  // Create PlayerProfiles
  const player1 = await prisma.playerProfile.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440300',
      userAccountUuid: '550e8400-e29b-41d4-a716-446655440000',
      name: 'HeroKnight',
      description: 'A brave knight from the kingdom of Rune-Midgard',
      imageUrl: 'https://assets.game.com/profiles/heroknight.png',
      level: 42,
      exp: 156000,
      currentMana: 350,
      maxMana: 500,
      zeny: 250000,
      crystalShard: 75,
      goldenPoringCoin: 8,
      poringCoin: 250,
      gachaponTicket: 5,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const player2 = await prisma.playerProfile.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440301',
      userAccountUuid: '550e8400-e29b-41d4-a716-446655440001',
      name: 'WizardMaster',
      description: 'A powerful wizard who has mastered the arcane arts',
      imageUrl: 'https://assets.game.com/profiles/wizardmaster.png',
      level: 56,
      exp: 287000,
      currentMana: 850,
      maxMana: 850,
      zeny: 180000,
      crystalShard: 120,
      goldenPoringCoin: 15,
      poringCoin: 180,
      gachaponTicket: 12,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  console.log('Created player profiles:', { player1, player2 });

  // Create CharacterCustomizations
  const customization1 = await prisma.characterCustomization.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440400',
      playerUuid: player1.uuid,
      customeBaseUuid: hat.uuid,
      obtainUuid: gacha.uuid,
      obtainDate: new Date('2025-01-15'),
      isFashion: 1,
      isActive: 1,
      isEquiped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const customization2 = await prisma.characterCustomization.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440401',
      playerUuid: player1.uuid,
      customeBaseUuid: armor.uuid,
      obtainUuid: quest.uuid,
      obtainDate: new Date('2025-01-10'),
      isFashion: 0,
      isActive: 1,
      isEquiped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  const customization3 = await prisma.characterCustomization.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440402',
      playerUuid: player2.uuid,
      customeBaseUuid: weapon.uuid,
      obtainUuid: shop.uuid,
      obtainDate: new Date('2025-02-05'),
      isFashion: 0,
      isActive: 1,
      isEquiped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1
    },
  });

  console.log('Created character customizations:', { customization1, customization2, customization3 });

  console.log('Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });