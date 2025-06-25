import { MongooseConnection, MongooseTransactionOption, MongooseTransactionSession } from './types';
import { DECLARATION, TransactionManager, TransactionType } from '@transaction-decorator/core';

export class MongooseTransactionManager implements TransactionManager<MongooseTransactionOption> {
  constructor(private readonly connection: MongooseConnection) {}

  async begin(transactionOption?: MongooseTransactionOption): Promise<unknown> {
    const session = await this.connection.startSession(transactionOption);
    // TODO: startTransaction()에 Transaction Option을 알맞게 넣어주기
    session.startTransaction();
    return session;
  }

  async commit(_: unknown): Promise<void> {
    await (_ as MongooseTransactionSession).commitTransaction();
    await this.release(_);
  }

  getType(): TransactionType {
    return DECLARATION;
  }

  async release(_: unknown): Promise<void> {
    await (_ as MongooseTransactionSession).endSession();
  }

  async rollback(_: unknown): Promise<void> {
    await (_ as MongooseTransactionSession).abortTransaction();
  }

  async withTransaction(method: unknown, transactionOption?: MongooseTransactionOption): Promise<unknown> {
    // Mongoose do not support callback transaction
    return Promise.resolve(undefined);
  }
}
