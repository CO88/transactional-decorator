import { DataSource, EntityManager, EntityTarget, ObjectLiteral, QueryRunner, Repository } from 'typeorm';
import { AlsService, TRANSACTION_SESSION } from '@co88/transaction-decorator-core';

const GET_REPOSITORY = 'getRepository';

function getEntityManager(ts: unknown): EntityManager {
  return ts instanceof EntityManager ? ts : (ts as QueryRunner).manager;
}

/**
 * Using Proxy, if there is a transaction in AsyncLocalStorage,
 * it intercepts "getRepository in EntityManager" and injects the transaction
 * it is EntityManager in this context.
 *
 * @param dataSource DataSource
 */
export function proxyDataSource(dataSource: DataSource): DataSource {
  return new Proxy(dataSource, {
    get(target: DataSource, p: string | symbol): any {
      if (p !== GET_REPOSITORY) {
        const v = (target as any)[p];
        return typeof v === 'function' ? v.bind(target) : v;
      }
      return <Entity extends ObjectLiteral>(entity: EntityTarget<Entity>): Repository<Entity> => {
        const baseRepository = target.getRepository(entity);
        return new Proxy(baseRepository, {
          get(target: Repository<Entity>, p: string | symbol): any {
            const ts = AlsService.get(TRANSACTION_SESSION);
            const actual = ts ? getEntityManager(ts).getRepository(entity) : baseRepository;
            const v = (actual as any)[p];
            return typeof v === 'function' ? v.bind(actual) : v;
          },
        });
      };
    },
  });
}
