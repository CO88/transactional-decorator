import { DECLARATION, TransactionManager, TransactionType } from '../../index';

export class DeclarTransactionManager implements TransactionManager<any> {
  async begin(transactionOption?: any): Promise<unknown> {
    return Promise.resolve('begin');
  }

  async commit(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  getType(): TransactionType {
    return DECLARATION;
  }

  async release(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  async rollback(tx: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  async withTransaction(method: unknown, transaction?: any): Promise<unknown> {
    return Promise.resolve(undefined);
  }
}
