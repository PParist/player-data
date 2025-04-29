import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data to avoid conflicts
  await prisma.costumes.deleteMany();
  await prisma.obtainBases.deleteMany();
  await prisma.costumeBases.deleteMany();
  await prisma.playerProfiles.deleteMany();

  console.log('Seeding...');

  // Create ObtainBases records
  const gacha = await prisma.obtainBases.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440100',
      obtainsType: 'GACHA',
      typesUuid: '550e8400-e29b-41d4-a716-446655440101',
      info: 'Obtain items through gacha system',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const shop = await prisma.obtainBases.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440102',
      obtainsType: 'SHOP',
      typesUuid: '550e8400-e29b-41d4-a716-446655440103',
      info: 'Obtain items through in-game shop',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const quest = await prisma.obtainBases.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440104',
      obtainsType: 'QUEST',
      typesUuid: '550e8400-e29b-41d4-a716-446655440105',
      info: 'Obtain items through completing quests',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  console.log('Created obtain bases:', { gacha, shop, quest });

  // Create CostumeBases
  const hat = await prisma.costumeBases.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440200',
      equipmentId: 'EQ_HAT_001',
      name: 'Poring Hat',
      info: 'A cute hat that resembles a Poring',
      obtainsBaseUuid: gacha.uuid,
      imagePath: 'https://assets.game.com/items/poring_hat.png',
      prefabPath: 'https://assets.game.com/prefabs/poring_hat.prefab',
      model: 1,
      isDefault: 0,
      isColorable: 1,
      isActive: 1,
      equipType: 1, // Hat
      tier: 3,
      colors: '["#FF5733", "#33FF57", "#3357FF"]',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const armor = await prisma.costumeBases.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440201',
      equipmentId: 'EQ_ARMOR_001',
      name: 'Novice Armor',
      info: 'Standard armor for beginners',
      obtainsBaseUuid: quest.uuid,
      imagePath: 'https://assets.game.com/items/novice_armor.png',
      prefabPath: 'https://assets.game.com/prefabs/novice_armor.prefab',
      model: 2,
      isDefault: 1,
      isColorable: 0,
      isActive: 1,
      equipType: 2, // Armor
      tier: 1,
      colors: null,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const weapon = await prisma.costumeBases.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440202',
      equipmentId: 'EQ_WEAPON_001',
      name: 'Magic Staff',
      info: 'A powerful staff infused with magical energy',
      obtainsBaseUuid: shop.uuid,
      imagePath: 'https://assets.game.com/items/magic_staff.png',
      prefabPath: 'https://assets.game.com/prefabs/magic_staff.prefab',
      model: 3,
      isDefault: 0,
      isColorable: 1,
      isActive: 1,
      equipType: 3, // Weapon
      tier: 4,
      colors: '["#5733FF", "#33FF57", "#FF5733"]',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  console.log('Created costume bases:', { hat, armor, weapon });

  // Create PlayerProfiles
  const player1 = await prisma.playerProfiles.create({
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
      version: '1.0.0',
    },
  });

  const player2 = await prisma.playerProfiles.create({
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
      version: '1.0.0',
    },
  });

  console.log('Created player profiles:', { player1, player2 });

  // Create Costumes
  const costume1 = await prisma.costumes.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440400',
      playerUuid: player1.uuid,
      costumeBaseUuid: hat.uuid,
      currentColor: '#FF5733',
      obtainDate: new Date('2025-01-15'),
      isFashion: 1,
      isActive: 1,
      isEquipped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const costume2 = await prisma.costumes.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440401',
      playerUuid: player1.uuid,
      costumeBaseUuid: armor.uuid,
      currentColor: null,
      obtainDate: new Date('2025-01-10'),
      isFashion: 0,
      isActive: 1,
      isEquipped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  const costume3 = await prisma.costumes.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440402',
      playerUuid: player2.uuid,
      costumeBaseUuid: weapon.uuid,
      currentColor: '#5733FF',
      obtainDate: new Date('2025-02-05'),
      isFashion: 0,
      isActive: 1,
      isEquipped: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: '1.0.0',
    },
  });

  console.log('Created costumes:', { costume1, costume2, costume3 });

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