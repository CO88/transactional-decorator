import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { TransactionOption } from '@co88/transaction-decorator-core';

export type TypeormTransactionOption = IsolationLevel & TransactionOption;
export type TypeormQueryRunner = QueryRunner;
export type TypeormEntityManager = EntityManager;
export type TypeormDataSource = DataSource;
