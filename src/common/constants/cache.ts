// Cache constants
export const CACHE_TTL = {
    PROFILE: 600, 
    ALL_PROFILES: 300, 
    PROFILES_LIST: 180, 
  };
  
export const CACHE_KEYS = {
    ALL_PROFILES: 'player_profiles:all',
    PROFILE: (uuid: string) => `player_profile:${uuid}`,
    PROFILES_LIST: 'player_profiles:list',
  };

export const PERFIX = {
    ALL_PROFILES: 'player_profiles:all',
    PROFILE: (uuid: string) => `player_profile:${uuid}`,
    PROFILES_LIST: 'player_profiles:list',
  };