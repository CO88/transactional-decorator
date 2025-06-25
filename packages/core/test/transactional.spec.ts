import { CallbackTransactionManager } from './__fixtures__/callback-transaction.mananger';

import { DeclarTransactionManager } from './__fixtures__/declare-transaction.manager';
import { registerTransactionManager, Transactional } from '../index';

describe('@Transacrional Decorator', () => {
  let callbackTransactionManager: CallbackTransactionManager;
  let declareTransactionMananger: DeclarTransactionManager;

  beforeEach(() => {
    callbackTransactionManager = new CallbackTransactionManager();
    declareTransactionMananger = new DeclarTransactionManager();

    registerTransactionManager('callback', callbackTransactionManager);
    registerTransactionManager('declare', declareTransactionMananger);
  });

  describe('CALLBACK Type Transaction Manager', () => {
    describe('Normal Flow', () => {
      it('should execute complete transaction lifecycle', async () => {
        const beginSpy = jest.spyOn(callbackTransactionManager, 'begin');
        const commitSpy = jest.spyOn(callbackTransactionManager, 'commit');
        const rollbackSpy = jest.spyOn(callbackTransactionManager, 'rollback');
        const withTransactionSpy = jest.spyOn(callbackTransactionManager, 'withTransaction');

        class TestServcie {
          @Transactional('callback')
          async methodA(): Promise<string> {
            return 'success';
          }
        }

        const service = new TestServcie();
        const result = await service.methodA();

        expect(withTransactionSpy).toHaveBeenCalledTimes(1);
        expect(beginSpy).toHaveBeenCalledTimes(0);
        expect(commitSpy).toHaveBeenCalledTimes(0);
        expect(rollbackSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('Nested Transactions', () => {
      it('should reuse existing transaction in nested calls', async () => {
        const beginSpy = jest.spyOn(callbackTransactionManager, 'begin');
        const commitSpy = jest.spyOn(callbackTransactionManager, 'commit');
        const rollbackSpy = jest.spyOn(callbackTransactionManager, 'rollback');
        const withTransactionSpy = jest.spyOn(callbackTransactionManager, 'withTransaction');

        class TestService {
          @Transactional('callback')
          async outerMethod(): Promise<string> {
            await this.innerMethod();
            return 'outer';
          }

          @Transactional('callback')
          async innerMethod(): Promise<string> {
            return 'inner';
          }
        }

        const service = new TestService();
        await service.outerMethod();

        expect(withTransactionSpy).toHaveBeenCalledTimes(1);
        expect(beginSpy).toHaveBeenCalledTimes(0);
        expect(commitSpy).toHaveBeenCalledTimes(0);
        expect(rollbackSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('Error Handling', () => {
      it('should rollback on method exception', async () => {
        const beginSpy = jest.spyOn(callbackTransactionManager, 'begin');
        const commitSpy = jest.spyOn(callbackTransactionManager, 'commit');
        const rollbackSpy = jest.spyOn(callbackTransactionManager, 'rollback');
        const withTransactionSpy = jest.spyOn(callbackTransactionManager, 'withTransaction');

        class TestServcie {
          @Transactional('callback')
          async methodA(): Promise<string> {
            throw new Error('Method A Error');
          }
        }

        const service = new TestServcie();
        await service.methodA();

        expect(withTransactionSpy).toHaveBeenCalledTimes(1);
        expect(beginSpy).toHaveBeenCalledTimes(0);
        expect(commitSpy).toHaveBeenCalledTimes(0);
        expect(rollbackSpy).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('DECLARATION Type Transaction Manager', () => {
    describe('Normal Flow', () => {
      it('should execute complete transaction lifecycle', async () => {
        const beginSpy = jest.spyOn(declareTransactionMananger, 'begin');
        const commitSpy = jest.spyOn(declareTransactionMananger, 'commit');
        const rollbackSpy = jest.spyOn(declareTransactionMananger, 'rollback');
        const withTransactionSpy = jest.spyOn(declareTransactionMananger, 'withTransaction');

        class TestServcie {
          @Transactional('declare')
          async methodA(): Promise<string> {
            return 'success';
          }
        }

        const service = new TestServcie();
        await service.methodA();

        expect(withTransactionSpy).toHaveBeenCalledTimes(0);
        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(commitSpy).toHaveBeenCalledTimes(1);
        expect(rollbackSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('Nested Transactions', () => {
      it('should reuse existing transaction in nested calls', async () => {
        const beginSpy = jest.spyOn(declareTransactionMananger, 'begin');
        const commitSpy = jest.spyOn(declareTransactionMananger, 'commit');
        const rollbackSpy = jest.spyOn(declareTransactionMananger, 'rollback');
        const withTransactionSpy = jest.spyOn(declareTransactionMananger, 'withTransaction');

        class TestService {
          @Transactional('declare')
          async outerMethod(): Promise<string> {
            await this.innerMethod();
            return 'outer';
          }

          @Transactional('declare')
          async innerMethod(): Promise<string> {
            return 'inner';
          }
        }

        const service = new TestService();
        await service.outerMethod();

        expect(withTransactionSpy).toHaveBeenCalledTimes(0);
        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(commitSpy).toHaveBeenCalledTimes(1);
        expect(rollbackSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('Error Handling', () => {
      it('should rollback on method exception', async () => {
        const beginSpy = jest.spyOn(declareTransactionMananger, 'begin');
        const commitSpy = jest.spyOn(declareTransactionMananger, 'commit');
        const rollbackSpy = jest.spyOn(declareTransactionMananger, 'rollback');
        const withTransactionSpy = jest.spyOn(declareTransactionMananger, 'withTransaction');

        class TestServcie {
          @Transactional('declare')
          async methodA(): Promise<string> {
            throw new Error('Method A Error');
          }
        }

        const service = new TestServcie();
        await expect(service.methodA()).rejects.toThrow('Method A Error');

        expect(withTransactionSpy).toHaveBeenCalledTimes(0);
        expect(beginSpy).toHaveBeenCalledTimes(1);
        expect(commitSpy).toHaveBeenCalledTimes(0);
        expect(rollbackSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});