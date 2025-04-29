import { registerEnumType } from '@nestjs/graphql';
import { GraphqlConfig } from '../configs/config.interface';
export enum Rule {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  IS_OWNER = 'isOwner'
}

export function registerGraphQLEnums(config?: GraphqlConfig) {
  registerEnumType(Rule, {
    name: 'Rule',
    description: 'User authorization rules',
  });
}
