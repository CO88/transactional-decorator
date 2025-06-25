import { DeclarTransactionManager } from './__fixtures__/declare-transaction.manager';
import { TransactionManager } from '@co88/transaction-decorator-core/types';
import { getTransactionManager, registerTransactionManager } from '@co88/transaction-decorator-core/container';

describe('Transaction Manager', () => {
  let transactionManager: TransactionManager<any>;
  beforeEach(() => {
    transactionManager = new DeclarTransactionManager();
  });

  describe('register transactionManager', () => {
    let token: string;
    beforeEach(() => {
      token = 'test';
      registerTransactionManager(token, transactionManager);
    });

    it('should get expected result', () => {
      const result = getTransactionManager(token);
      expect(result).toBe(transactionManager);
    });

    it('should get expected throw', () => {
      const doesnotToken = 'test1';
      expect(() => getTransactionManager(doesnotToken)).toThrow(Error);
    });
  });
});