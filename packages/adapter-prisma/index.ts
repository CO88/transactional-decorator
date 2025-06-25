export * from './types/types';
export * from './prisma.transaction-manager';
export * from './proxy/prisma.proxy';

// Auto-register helper
export { registerTransactionManager } from '@transaction-decorator/core';

// Default export for convenience
export { PrismaTransactionManager } from './prisma.transaction-manager';
