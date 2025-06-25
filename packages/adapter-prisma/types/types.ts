import { TransactionOption } from '@transaction-decorator/core';

export type PrismaTransactionOption = (string | undefined) & TransactionOption;
