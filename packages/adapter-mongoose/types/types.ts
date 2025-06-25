import { ClientSession, ClientSessionOptions, Connection } from 'mongoose';
import { TransactionOption } from '@transaction-decorator/core';

export type MongooseTransactionOption = ClientSessionOptions & TransactionOption;
export type MongooseTransactionSession = ClientSession;
export type MongooseConnection = Connection;
