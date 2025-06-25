import { DataSource, EntityManager, QueryRunner, Repository } from 'typeorm';
import { proxyDataSource } from '@co88/transaction-decorator-adapter-typeorm/proxy';
import { AlsService, TRANSACTION_SESSION } from '@co88/transaction-decorator-core';

class TestEntity {
  id: number;
  name: string;
}

describe('proxyDataSource', () => {
  let mockDataSource: jest.Mocked<DataSource>;
  let mockRepository: jest.Mocked<Repository<TestEntity>>;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockTransactionRepository: jest.Mocked<Repository<TestEntity>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockTransactionRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockEntityManager = {
      getRepository: jest.fn().mockReturnValue(mockTransactionRepository),
    } as any;

    mockQueryRunner = {
      manager: mockEntityManager,
    } as any;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
      manager: mockEntityManager,
      isInitialized: true,
    } as any;
  });

  describe('Basic Operation', () => {
    it('should delegate to the origin dataSource at properties other than getRepository', () => {
      const proxiedDataSource = proxyDataSource(mockDataSource);

      expect(proxiedDataSource.isInitialized).toBe(true);
      expect(proxiedDataSource.manager).toBe(mockEntityManager);
    });

    it('should bind to correct context at method other than getRepository', () => {
      const mockMethod = jest.fn();
      (mockDataSource as any).someMethod = mockMethod;

      const proxiedDataSource = proxyDataSource(mockDataSource);
      (proxiedDataSource as any).someMethod();

      expect(mockMethod).toHaveBeenCalledWith();
    });
  });

  describe('without Transaction', () => {
    it('should use to basic repository', () => {
      const proxiedDataSource = proxyDataSource(mockDataSource);
      const repository = proxiedDataSource.getRepository(TestEntity);

      expect(mockDataSource.getRepository).toHaveBeenCalledWith(TestEntity);
      expect(repository).toBeDefined();
    });

    it('should delegate repository method calls to the base repository', async () => {
      const testData = [{ id: 1, name: 'test' }];
      mockRepository.find.mockResolvedValue(testData);

      const proxiedDataSource = proxyDataSource(mockDataSource);
      const repository = proxiedDataSource.getRepository(TestEntity);

      const result = await repository.find();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(mockTransactionRepository.find).not.toHaveBeenCalled();
      expect(result).toBe(testData);
    });
  });

  describe('with EntityManager Transaction ', () => {
    let realEntityManager: EntityManager;
    let mockGetRepository: any;

    beforeEach(() => {
      realEntityManager = new EntityManager(mockDataSource);
      mockGetRepository = jest.spyOn(realEntityManager, 'getRepository');
      mockGetRepository.mockReturnValue(mockTransactionRepository);
    });

    it('should use the repository from the transaction EntityManager', async () => {
      const proxiedDataSource = proxyDataSource(mockDataSource);

      await AlsService.run(async () => {
        AlsService.set(TRANSACTION_SESSION, realEntityManager);

        const repository = proxiedDataSource.getRepository(TestEntity);
        await repository.find();
      });

      expect(mockGetRepository).toHaveBeenCalledWith(TestEntity);
    });

    it('should delegate repository method calls to the transaction repository ', async () => {
      const testData = [{ id: 1, name: 'transaction-test' }];
      mockTransactionRepository.find.mockResolvedValue(testData);

      const proxiedDataSource = proxyDataSource(mockDataSource);

      await AlsService.run(async () => {
        AlsService.set(TRANSACTION_SESSION, realEntityManager);
        const repository = proxiedDataSource.getRepository(TestEntity);

        const result = await repository.find();
        expect(result).toBe(testData);
      });

      expect(mockTransactionRepository.find).toHaveBeenCalled();
      expect(mockRepository.find).not.toHaveBeenCalled();
    });

    it('should check transaction session on every method call ', async () => {
      const proxiedDataSource = proxyDataSource(mockDataSource);
      const repository = proxiedDataSource.getRepository(TestEntity);

      jest.spyOn(AlsService, 'get');

      await repository.find();
      await repository.save({} as TestEntity);

      expect(AlsService.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('with QueryRunner Transaction', () => {
    it('should get repository by manager of QueryRunner', async () => {
      const proxiedDataSource = proxyDataSource(mockDataSource);

      await AlsService.run(async () => {
        AlsService.set(TRANSACTION_SESSION, mockQueryRunner);

        const repository = proxiedDataSource.getRepository(TestEntity);
        await repository.find();
      });

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(TestEntity);
      expect(mockTransactionRepository.find).toHaveBeenCalled();
    });
  });
});
