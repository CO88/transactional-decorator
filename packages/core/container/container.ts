import { TransactionManager } from '../types';

export const Container = new Map<string, any>();

export function registerTransactionManager<TransactionOption>(
  token: string,
  instance: TransactionManager<TransactionOption>,
): void {
  Container.set(token, instance);
}

export function getTransactionManager<TransactionOption>(token: string): TransactionManager<TransactionOption> {
  const instance = Container.get(token);
  if (!instance) throw new Error(`No provider for token ${token}`);
  return instance;
}
