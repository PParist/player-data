import { GraphqlConfig } from './common/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { authDirectiveTransformer } from 'src/common/graphql/auth_directive';
import { addDirectiveDefinitionsToSchema } from 'src/common/utils/schema.utils';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(private configService: ConfigService) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');
    return {
      // schema options
      autoSchemaFile: graphqlConfig.schemaDestination || './src/schema.graphql',
      sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      // subscription
      installSubscriptionHandlers: true,
      includeStacktraceInErrorResponses: graphqlConfig.debug,
      playground: graphqlConfig.playgroundEnabled,
      context: ({ req }) => ({ req }),
      transformSchema: (schema) => {
        schema = addDirectiveDefinitionsToSchema(schema, `
          enum Rule {
            ADMIN
            USER
            GUEST
          }
          directive @auth(rule: String!) on FIELD_DEFINITION
        `);
        schema = authDirectiveTransformer(schema);
        
        return schema;
      },
    };
  }
}
