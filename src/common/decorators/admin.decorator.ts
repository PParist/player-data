import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export function AdminField() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args) {
      const ctx = GqlExecutionContext.create(args[2]);
      const user = ctx.getContext().req.user;

      if (!user || !user.isAdmin) {
        return null;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
