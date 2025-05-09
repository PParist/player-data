import { registerEnumType } from '@nestjs/graphql';
export enum Rule {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  IS_OWNER = 'isOwner',
}

export function registerGraphQLEnums() {
  registerEnumType(Rule, {
    name: 'Rule',
    description: 'User authorization rules',
  });
}
