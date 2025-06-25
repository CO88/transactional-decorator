import { CALLBACK, TransactionManager, TransactionType } from '../../index';

export class CallbackTransactionManager implements TransactionManager<any> {
  begin(transactionOption?: any): Promise<unknown> {
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

  withTransaction(method: unknown, transaction?: any): Promise<unknown> {
    return Promise.resolve(undefined);
  }
}