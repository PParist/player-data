import { v4 as uuidv4 } from 'uuid';

/**
 * ฟังก์ชันสร้างชื่อที่มีความเป็น unique สูงเพื่อลดจำนวนการ query กับฐานข้อมูล
 * @param theme - ธีมของชื่อที่ต้องการ
 * @param useUUIDSuffix - ใช้ UUID บางส่วนเป็นคำต่อท้ายเพื่อเพิ่มความเป็น unique หรือไม่
 * @returns ชื่อที่มีความเป็น unique สูง
 */
export function generateHighlyUniquePlayerName(
  theme: 'fantasy' | 'scifi' | 'cute' | 'random' = 'random',
  useUUIDSuffix = true,
): string {
  // คำขึ้นต้น
  const prefixes = {
    fantasy: [
      'Dragon', 'Shadow', 'Storm', 'Star', 'Frost', 'Moon', 'Sun', 'Fire', 
      'Thunder', 'Wind', 'Crystal', 'Dark', 'Light', 'Sky', 'Ocean', 'Forest'
    ],
    scifi: [
      'Neo', 'Cyber', 'Tech', 'Quantum', 'Astro', 'Hyper', 'Mecha', 'Pulse',
      'Nexus', 'Vector', 'Fusion', 'Nova', 'Zero', 'Omega', 'Alpha', 'Prime'
    ],
    cute: [
      'Fluffy', 'Bubbly', 'Cozy', 'Fuzzy', 'Sparkle', 'Happy', 'Tiny', 'Sweet',
      'Bouncy', 'Giggly', 'Cuddly', 'Snuggle', 'Twinkle', 'Merry', 'Jolly'
    ]
  };
  
  // คำลงท้าย
  const suffixes = {
    fantasy: [
      'blade', 'heart', 'soul', 'knight', 'walker', 'hunter', 'slayer',
      'mage', 'bringer', 'weaver', 'keeper', 'born', 'forge', 'strike'
    ],
    scifi: [
      'tron', 'byte', 'flux', 'core', 'wave', 'sphere', 'link', 'bot',
      'droid', 'net', 'mind', 'glow', 'drive', 'pulse', 'unit', 'grid'
    ],
    cute: [
      'puff', 'bun', 'bean', 'cake', 'pie', 'pop', 'fluff', 'kitty',
      'puppy', 'bear', 'star', 'heart', 'drop', 'dot', 'sprinkle'
    ]
  };
  
  // เลือกธีมถ้าเป็น random
  let selectedTheme = theme;
  if (theme === 'random') {
    const themes = ['fantasy', 'scifi', 'cute'];
    selectedTheme = themes[Math.floor(Math.random() * themes.length)] as 'fantasy' | 'scifi' | 'cute';
  }
  
  // เลือกคำขึ้นต้นและคำลงท้ายตามธีม
  const themePrefix = prefixes[selectedTheme] || prefixes['fantasy'];
  const themeSuffix = suffixes[selectedTheme] || suffixes['fantasy'];
  
  // สุ่มคำ
  const prefix = themePrefix[Math.floor(Math.random() * themePrefix.length)];
  const suffix = themeSuffix[Math.floor(Math.random() * themeSuffix.length)];
  
  // เพิ่มความเป็น unique โดย:
  
  // 1. ใช้ timestamp ปัจจุบัน (เวลาเป็นมิลลิวินาที)
  const timestamp = Date.now();
  
  // 2. สร้าง UUID เพื่อเพิ่มความเป็น unique (ถ้าเลือกใช้)
  let uniquePart: string;
  
  if (useUUIDSuffix) {
    // ใช้แค่ 6 ตัวแรกของ UUID เพื่อให้ชื่อไม่ยาวเกินไป
    const shortUUID = uuidv4().replace(/-/g, '').substring(0, 6);
    uniquePart = `${timestamp % 1000}${shortUUID}`;
  } else {
    // ใช้แค่ timestamp บวกกับตัวเลขสุ่ม 3 หลัก
    const randomNum = Math.floor(Math.random() * 900) + 100; // ตัวเลขสุ่ม 3 หลัก (100-999)
    uniquePart = `${timestamp % 1000}${randomNum}`;
  }
  
  // รวมทั้งหมดเป็นชื่อ
  const name = `${prefix}${suffix}${uniquePart}`;
  
  return name;
}

/**
 * ฟังก์ชันสร้างชื่อที่มีความเป็น unique สูงด้วยวิธีอื่น
 * โดยใช้คำกลางที่มีความหมาย
 * @returns ชื่อ player ที่ unique และอ่านง่าย
 */
export function generateReadableUniquePlayerName(): string {
  // คำคุณศัพท์
  const adjectives = [
    'Brave', 'Swift', 'Mighty', 'Clever', 'Epic', 'Noble', 'Fierce', 'Wild',
    'Magic', 'Mystic', 'Quick', 'Vivid', 'Silent', 'Golden', 'Royal', 'Ancient'
  ];
  
  // คำนาม
  const nouns = [
    'Warrior', 'Hunter', 'Knight', 'Wizard', 'Ranger', 'Master', 'Hero', 'Legend',
    'Dragon', 'Phoenix', 'Tiger', 'Eagle', 'Wolf', 'Lion', 'Hawk', 'Bear'
  ];
  
  // สุ่มคำคุณศัพท์และคำนาม
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // สร้างตัวเลขสุ่ม 4 หลัก
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  
  // รวมเป็นชื่อที่อ่านง่ายและมีความเป็น unique สูง
  return `${adjective}${noun}${randomNum}`;
}

/**
 * ฟังก์ชันสร้างชื่อที่มีความเป็น unique สูงโดยใช้ Math.random และ timestamp
 * ทำให้ไม่ต้องพึ่ง uuid library
 * @param prefix - คำนำหน้า (ถ้าไม่ระบุจะสุ่มเลือก)
 * @returns ชื่อที่ unique สูงมาก
 */
export function generateSuperUniquePlayerName(prefix?: string): string {
  // คำนำหน้า (ถ้าไม่ระบุจะสุ่มเลือก)
  const prefixes = [
    'Player', 'Gamer', 'Pro', 'Elite', 'Master', 'Champion', 'Legend', 'Hero',
    'Ninja', 'Warrior', 'Knight', 'Wizard', 'Hunter', 'Sniper', 'Racer', 'Rookie'
  ];
  
  // เลือกคำนำหน้า
  const selectedPrefix = prefix || prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // สร้าง timestamp ปัจจุบัน
  const timestamp = Date.now();
  
  // สร้างตัวเลขสุ่มจาก Math.random() แบบไม่ซ้ำกัน
  // โดยการแปลง Math.random() เป็น base-36 string
  const randomPart = Math.random().toString(36).substring(2, 8);
  
  // รวมเป็นชื่อที่มีความเป็น unique สูงมาก
  return `${selectedPrefix}${timestamp % 10000}${randomPart}`;
}