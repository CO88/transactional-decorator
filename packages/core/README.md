# @co88/transaction-decorator-core

Core library for transaction decorator with common interfaces and utilities.

## Installation

```bash
npm install @co88/transaction-decorator-core
```

## Usage

This is the core package that provides the basic interfaces and decorators. You'll also need to install specific adapter packages for your ORM:

- [`@co88/transaction-decorator-adapter-mongoose`](../adapter-mongoose) for Mongoose
- [`@co88/transaction-decorator-adapter-prisma`](../adapter-prisma) for Prisma
- [`@co88/transaction-decorator-adapter-typeorm`](../adapter-typeorm) for TypeORM

## API

### Core Interfaces

```typescript
import { TransactionManager, registerTransactionManager } from '@co88/transaction-decorator-core';
```

### Decorator

```typescript
import { Transactional } from '@co88/transaction-decorator-core';

class UserService {
  @Transactional('userdb')
  async createUser(userData: any) {
    // Your transactional logic here
  }
}
```

### Container

```typescript
import { registerTransactionManager } from '@co88/transaction-decorator-core';

// Register your transaction manager
registerTransactionManager('userdb', transactionManagerInstance);
```

## License

MIT
