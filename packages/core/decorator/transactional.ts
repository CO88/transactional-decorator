import { getTransactionManager } from '../container';
import { AlsService, StorageKey } from '../context';
import { CALLBACK, DECLARATION } from '../types';
import { TransactionOption } from './types';

/**
 * Key for storing transaction in async local storage
 */
export const TRANSACTION_SESSION: StorageKey = 'TRANSACTION_SESSION';

export function Transactional(token: string): MethodDecorator;
export function Transactional(token: string, option: TransactionOption): MethodDecorator;
export function Transactional(...args: any[]): MethodDecorator {
  let token: string, option: unknown;
  if (args.length === 1) {
    token = args[0];
  } else if (args.length === 2) {
    token = args[0];
    option = args[1];
  }

  return (target: any, _: string | symbol, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const als = AlsService;
      const currentTx = als.get(TRANSACTION_SESSION);
      const originMethodCall = () => originalMethod.apply(this, args);
      const createTx = async () => {
        const transactionManager = getTransactionManager(token); // get txManagerService

        switch (transactionManager.getType()) {
          case CALLBACK: {
            return transactionManager.withTransaction(async (tx: unknown) => {
              als.set(TRANSACTION_SESSION, tx);
              return await originMethodCall();
            }, option);
          }
          case DECLARATION: {
            try {
              const tx = await transactionManager.begin(option);
              als.set(TRANSACTION_SESSION, tx);
              const result = await originMethodCall();
              await transactionManager.commit(tx);
              return result;
            } catch (e) {
              await transactionManager.rollback(als.get(TRANSACTION_SESSION));
              throw e;
            }
          }
          default:
            throw new Error('transactionManager type must be either "CALLBACK" or "DECLARATION"');
        }
      };

      return als.run(async () => {
        if (currentTx) {
          als.set(TRANSACTION_SESSION, currentTx);
          return await originMethodCall();
        }
        return await createTx();
      });
    };
  };
}
