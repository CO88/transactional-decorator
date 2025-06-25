import { TransactionType } from './constants';

export interface TransactionManager<TransactionOption> {
  begin(transactionOption?: TransactionOption): Promise<unknown>;

  commit(tx: unknown): Promise<void>;

  rollback(tx: unknown): Promise<void>;

  release(tx: unknown): Promise<void>;

  getType(): TransactionType;

  withTransaction(method: unknown, transaction?: TransactionOption): Promise<unknown>;
}
