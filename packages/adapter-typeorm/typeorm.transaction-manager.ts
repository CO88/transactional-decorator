import { TypeormDataSource, TypeormEntityManager, TypeormQueryRunner, TypeormTransactionOption } from './types';
import { DECLARATION, TransactionManager, TransactionType } from '@co88/transaction-decorator-core';

export class TypeormTransactionManager implements TransactionManager<TypeormTransactionOption> {
  constructor(private readonly dataSource: TypeormDataSource) {}

  async begin(transactionOption?: TypeormTransactionOption): Promise<unknown> {
    const qr: TypeormQueryRunner = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction(transactionOption);
    return qr;
  }

  async commit(_: unknown): Promise<void> {
    await (_ as TypeormQueryRunner).commitTransaction();
    await this.release(_);
  }

  async rollback(_: unknown): Promise<void> {
    await (_ as TypeormQueryRunner).rollbackTransaction();
    await this.release(_);
  }

  async release(_: unknown): Promise<void> {
    await (_ as TypeormQueryRunner).release();
  }

  getType(): TransactionType {
    return DECLARATION;
  }

  async withTransaction(
    method: (entityManager: TypeormEntityManager) => Promise<unknown>,
    isolationLevel?: TypeormTransactionOption,
  ): Promise<unknown> {
    if (isolationLevel) {
      return await this.dataSource.transaction(isolationLevel, method);
    }
    return await this.dataSource.transaction(method);
  }
}
