import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data to avoid conflicts
  await prisma.costumes.deleteMany();
  await prisma.avatarBases.deleteMany();
  await prisma.frameBases.deleteMany();
  await prisma.obtainBases.deleteMany();
  await prisma.costumeBases.deleteMany();
  await prisma.playerProfiles.deleteMany();
  await prisma.announcements.deleteMany();
  await prisma.talentBases.deleteMany();

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
      version: 1,
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
      version: 1,
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
      version: 1,
    },
  });

  // Add new obtain base for events
  const event = await prisma.obtainBases.create({
    data: {
      id: 4,
      uuid: '550e8400-e29b-41d4-a716-446655440106',
      obtainsType: 'EVENT',
      typesUuid: '550e8400-e29b-41d4-a716-446655440107',
      info: 'Obtain items through special events',
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  console.log('Created obtain bases:', { gacha, shop, quest, event });

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
      version: 1,
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
      version: 1,
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
      version: 1,
    },
  });

  console.log('Created costume bases:', { hat, armor, weapon });

  // Create AvatarBases
  const avatarBase1 = await prisma.avatarBases.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440500',
      imageUrl: 'https://assets.game.com/avatars/knight_avatar.png',
      obtainsBaseUuid: quest.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const avatarBase2 = await prisma.avatarBases.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440501',
      imageUrl: 'https://assets.game.com/avatars/wizard_avatar.png',
      obtainsBaseUuid: gacha.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const avatarBase3 = await prisma.avatarBases.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440502',
      imageUrl: 'https://assets.game.com/avatars/archer_avatar.png',
      obtainsBaseUuid: shop.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  console.log('Created avatar bases:', {
    avatarBase1,
    avatarBase2,
    avatarBase3,
  });

  // Create FrameBases
  const frameBase1 = await prisma.frameBases.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440600',
      imageUrl: 'https://assets.game.com/frames/standard_frame.png',
      obtainsBaseUuid: quest.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const frameBase2 = await prisma.frameBases.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440601',
      imageUrl: 'https://assets.game.com/frames/premium_frame.png',
      obtainsBaseUuid: gacha.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const frameBase3 = await prisma.frameBases.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440602',
      imageUrl: 'https://assets.game.com/frames/legendary_frame.png',
      obtainsBaseUuid: event.uuid,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  console.log('Created frame bases:', { frameBase1, frameBase2, frameBase3 });

  // Create PlayerProfiles
  const player1 = await prisma.playerProfiles.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440300',
      userAccountUuid: '550e8400-e29b-41d4-a716-446655440000',
      name: 'HeroKnight',
      description: 'A brave knight from the kingdom of Rune-Midgard',
      avatar_url: 'https://assets.game.com/profiles/heroknight.png',
      frame_url: 'https://assets.game.com/profiles/frame.png',
      level: 42,
      exp: 156000,
      currentMana: 350,
      maxMana: 500,
      zeny: 250000,
      crystalShard: 75,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const player2 = await prisma.playerProfiles.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440301',
      userAccountUuid: '550e8400-e29b-41d4-a716-446655440001',
      name: 'WizardMaster',
      description: 'A powerful wizard who has mastered the arcane arts',
      avatar_url: 'https://assets.game.com/profiles/heroknight.png',
      frame_url: 'https://assets.game.com/profiles/frame.png',
      level: 56,
      exp: 287000,
      currentMana: 850,
      maxMana: 850,
      zeny: 180000,
      crystalShard: 120,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
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
      version: 1,
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
      version: 1,
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
      version: 1,
    },
  });

  console.log('Created costumes:', { costume1, costume2, costume3 });

  // Create Announcements
  const announcement1 = await prisma.announcements.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440700',
      info: 'Welcome to the Summer Festival! Join us for special events and rewards.',
      image: 'https://assets.game.com/announcements/summer_festival.png',
      createdAt: new Date('2025-04-01'),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date('2025-04-01'),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const announcement2 = await prisma.announcements.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440701',
      info: 'Maintenance scheduled for May 15, 2025. The game will be offline for 4 hours.',
      image: 'https://assets.game.com/announcements/maintenance.png',
      createdAt: new Date('2025-05-10'),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date('2025-05-10'),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const announcement3 = await prisma.announcements.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440702',
      info: 'New gacha items available! Check out the limited-time Dragon series costumes.',
      image: 'https://assets.game.com/announcements/dragon_gacha.png',
      createdAt: new Date('2025-03-15'),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date('2025-03-15'),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  console.log('Created announcements:', {
    announcement1,
    announcement2,
    announcement3,
  });

  // Create TalentBases
  const talentBase1 = await prisma.talentBases.create({
    data: {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440800',
      stage: 1,
      type: 'ATK',
      levelMax: 5,
      stat: '2',
      skillPoint: 1,
      zenySpend: 1000,
      imageParth: 'https://assets.game.com/talents/atk_boost.png',
      name: 'Attack Boost',
      detail: 'Increases attack power by 2 points per level',
      isActive: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const talentBase2 = await prisma.talentBases.create({
    data: {
      id: 2,
      uuid: '550e8400-e29b-41d4-a716-446655440801',
      stage: 1,
      type: 'DEF',
      levelMax: 5,
      stat: '2',
      skillPoint: 1,
      zenySpend: 1000,
      imageParth: 'https://assets.game.com/talents/def_boost.png',
      name: 'Defense Boost',
      detail: 'Increases defense by 2 points per level',
      isActive: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const talentBase3 = await prisma.talentBases.create({
    data: {
      id: 3,
      uuid: '550e8400-e29b-41d4-a716-446655440802',
      stage: 2,
      type: 'CRIT',
      levelMax: 3,
      stat: '0.10%',
      skillPoint: 2,
      zenySpend: 10000,
      imageParth: 'https://assets.game.com/talents/crit_boost.png',
      name: 'Critical Hit Rate',
      detail: 'Increases critical hit rate by 0.10% per level',
      isActive: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  const talentBase4 = await prisma.talentBases.create({
    data: {
      id: 4,
      uuid: '550e8400-e29b-41d4-a716-446655440803',
      stage: 3,
      type: 'HP',
      levelMax: 1,
      stat: '5.00%',
      skillPoint: 3,
      zenySpend: 100000,
      imageParth: 'https://assets.game.com/talents/hp_boost.png',
      name: 'Max HP Increase',
      detail: 'Increases maximum HP by 5.00%',
      isActive: 1,
      createdAt: new Date(),
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedAt: new Date(),
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      deletedAt: null,
      deletedBy: null,
      version: 1,
    },
  });

  console.log('Created talent bases:', {
    talentBase1,
    talentBase2,
    talentBase3,
    talentBase4,
  });

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
