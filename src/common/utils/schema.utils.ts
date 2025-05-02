// schema-utils.ts
import { GraphQLSchema, parse, buildASTSchema } from 'graphql';
import { mergeSchemas } from '@graphql-tools/schema';

export function addDirectiveDefinitionsToSchema(
  schema: GraphQLSchema,
  directiveSDL: string,
): GraphQLSchema {
  const directiveAST = parse(directiveSDL);
  const directiveSchema = buildASTSchema(directiveAST, { assumeValid: true });

  return mergeSchemas({
    schemas: [schema, directiveSchema],
  });
}
