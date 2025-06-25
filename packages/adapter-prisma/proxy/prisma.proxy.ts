import { PrismaClient } from '@prisma/client';
import { AlsService, TRANSACTION_SESSION } from '@co88/transaction-decorator-core';


/**
 * Using "Prisma extends", if there is a transaction in AsyncLocalStorage,
 * it intercepts all operation and injects the transaction.
 *
 * @param client PrismaClient
 */
export function proxyClient(client: PrismaClient): PrismaClient{
  const extendedPrisma = client.$extends({
    query: {
      $allModels: {
        $allOperations({ operation, model, args, query }: { operation: any; model: any; args: any; query: any }) {
          const tx = AlsService.get(TRANSACTION_SESSION);
          if (!tx) return query(args);
          if (!model) return (tx as any)[operation](args);
          return (tx as any)[model][operation](args);
        },
      }
    },
  });

  return extendedPrisma as unknown as PrismaClient;
}
