import { PrismaClient } from '@prisma/client';

import { PrismaTransactionOption } from './types/types';
import { CALLBACK, TransactionManager, TransactionType } from '@transaction-decorator/core';
import { TransactionOption } from '@co88/transaction-decorator-core/dist/decorator/types';

export class PrismaTransactionManager implements TransactionManager<PrismaTransactionOption> {
  constructor(private readonly prismaClient: PrismaClient) {}

  async begin(transactionOption?: PrismaTransactionOption): Promise<unknown> {
    return Promise.resolve(undefined);
  }

  commit(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  getType(): TransactionType {
    return CALLBACK;
  }

  release(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  rollback(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  withTransaction(method: (tx: PrismaClient) => Promise<unknown>, options?: TransactionOption): Promise<unknown> {
    return this.prismaClient.$transaction((tx: any) => method(tx), options);
  }
}
