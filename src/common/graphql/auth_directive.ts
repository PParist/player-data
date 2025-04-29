import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { ForbiddenError } from 'apollo-server-express';
import { UnauthorizedException } from '@nestjs/common';

export function authDirectiveTransformer(schema: GraphQLSchema): GraphQLSchema {

  const directiveName = 'auth';
  
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      // ตรวจสอบว่า field นี้มี directive @auth หรือไม่
      const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      
      // ถ้าไม่มี directive ให้ return fieldConfig เดิม
      if (!authDirective) {
        return fieldConfig;
      }
      
      // ดึงค่า rule จาก directive arguments
      const { rule } = authDirective;
      
      // เก็บ resolver เดิมไว้
      const { resolve = defaultFieldResolver } = fieldConfig;
      
      // สร้าง resolver ใหม่ที่มีการตรวจสอบสิทธิ์
      fieldConfig.resolve = async function(source, args, context, info) {
        const request = context.req;
        const user = request.user;
        
        if (!user) {
          throw new UnauthorizedException('Authentication required');
        }
        
        if (rule && ['ADMIN', 'USER', 'GUEST'].includes(String(rule).toUpperCase())) {
            const ruleValue = String(rule).toLowerCase();
            
            switch (ruleValue) {
              case 'admin':
                if (user.role !== 'admin') {
                  throw new UnauthorizedException('Admin access required');
                }
                break;
              case 'user':
                if (user.role !== 'user' && user.role !== 'admin') {
                  throw new UnauthorizedException('User access required');
                }
                break;
              case 'guest':
                if (source.ownerId !== user.userUuid && user.role !== 'admin') {
                  throw new UnauthorizedException('Owner access required');
                }
                break;
            }
          } else {
            // ถ้า rule ไม่ถูกต้อง
            throw new Error(`Invalid rule value: ${rule}`);
          }
          
          return resolve(source, args, context, info);
        };
        
        return fieldConfig;
      }
    });
  }