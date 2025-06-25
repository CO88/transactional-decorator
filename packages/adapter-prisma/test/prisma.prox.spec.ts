import { PrismaClient } from '@prisma/client';
import { proxyClient } from '@co88/transaction-decorator-adapter-prisma/proxy';
import { AlsService } from '@co88/transaction-decorator-core';

describe('proxy prisma', () => {
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    prismaClient = new PrismaClient();
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  describe('returned extended PrismaClient', () => {
    it('should be connected normally', async () => {
      const result = proxyClient(prismaClient);

      expect(typeof result.$connect).toBe('function');
      expect(typeof result.$disconnect).toBe('function');
      expect(typeof result.$transaction).toBe('function');

      await expect(result.$connect()).resolves.not.toThrow();
    });
  });

  describe('if have ALS, use operation with tx returned from AlsService', () => {
    let extendedPrisma: PrismaClient;

    beforeAll(() => {
      extendedPrisma = proxyClient(prismaClient);
    });

    it('should use returned tx from AlsService', async () => {
      const txNMock = {
        get user() {
          return {
            findMany: jest.fn().mockResolvedValue([]),
            findUnique: jest.fn(),
            findFirst: jest.fn().mockResolvedValue({}),
            create: jest.fn(),
          };
        },
      };

      jest.spyOn(AlsService, 'get').mockReturnValue(txNMock);

      const txSpy = jest.spyOn(txNMock as any, 'user', 'get');

      await extendedPrisma.user.findFirst();

      expect(txSpy).toHaveBeenCalled();
    });
  });
});
