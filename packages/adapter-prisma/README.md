# @co88/transaction-decorator-adapter-prisma

Prisma adapter for transaction decorator.

## Installation

```bash
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-prisma @prisma/client
```

## Usage

```typescript
import { registerTransactionManager, Transactional } from '@co88/transaction-decorator-core';
import { PrismaTransactionManager, proxyClient } from '@co88/transaction-decorator-adapter-prisma';
import { PrismaClient } from '@prisma/client';

// Setup client
const prisma = new PrismaClient();

// Apply proxy
proxyClient(prisma);

// Register transaction manager
const transactionManager = new PrismaTransactionManager(prisma);
registerTransactionManager('prisma', transactionManager);

// Use in your services
class UserService {
  @Transactional('prisma')
  async createUser(userData: any) {
    return await prisma.user.create({
      data: userData
    }); // Automatically uses transaction
  }
}
```

## License

MIT
