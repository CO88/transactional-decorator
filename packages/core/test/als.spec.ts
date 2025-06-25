import { AlsService } from '@co88/transaction-decorator-core/context';

describe('AsyncLocalStorage Serbice', () => {
  describe('Singleton Pattern', () => {
    it('should return the same instance every time', () => {
      const instance1 = AlsService;
      const instance2 = AlsService;

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(Object);
    });

    it('should maintain state across different access point', async () => {
      const key = 'test-singleton';
      const value = 'singleton-value';

      await AlsService.run(async () => {
        AlsService.set(key, value);

        const anotherReference = AlsService;
        expect(anotherReference.get(key)).toBe(value);
      });
    });
  });

  describe('Context Isolation', () => {
    it('should isolate storage between different async contexts', async () => {
      const key = 'shared-key';
      const results: string[] = [];

      const context1 = AlsService.run(async () => {
        AlsService.set(key, 'context-1-value');
        await new Promise((resolve) => setTimeout(resolve, 10));
        const value = AlsService.get(key);
        results.push(`context1: ${value}`);
      });

      const context2 = AlsService.run(async () => {
        AlsService.set(key, 'context-2-value');
        await new Promise((resolve) => setTimeout(resolve, 5));
        const value = AlsService.get(key);
        results.push(`context2: ${value}`);
      });

      await Promise.all([context1, context2]);

      expect(results).toHaveLength(2);
      expect(results).toContain('context1: context-1-value');
      expect(results).toContain('context2: context-2-value');
    });
  });

  it('should not leak values between sequential contexts', async () => {
    const key = 'sequential-key';
    await AlsService.run(async () => {
      AlsService.set(key, 'first-value');
      expect(AlsService.get(key)).toBe('first-value');
    });

    await AlsService.run(async () => {
      AlsService.set(key, 'second-value');
      expect(AlsService.get(key)).toBe('second-value');
    });
  });

  describe('Context Propagation', () => {
    it('should propagate context through nested async calls', async () => {
      const key = 'nested-key';
      let nestedValue: string | undefined;

      await AlsService.run(async () => {
        AlsService.set(key, 'outer-value');

        const nestedFunction = async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          nestedValue = AlsService.get(key);
        };

        await nestedFunction();
      });

      expect(nestedValue).toBe('outer-value');
    });

    it('should maintain context through Promise chains', async () => {
      const key = 'chain-key';
      const results: string[] = [];

      await AlsService.run(async () => {
        AlsService.set(key, 'initial');

        return Promise.resolve()
          .then(async () => {
            results.push(AlsService.get(key) || '');
            AlsService.set(key, 'middle');
            await new Promise((resolve) => setTimeout(resolve, 1));
          })
          .then(() => {
            results.push(AlsService.get(key) || '');
          });
      });
      expect(results).toEqual(['initial', 'middle']);
    });
  });
});