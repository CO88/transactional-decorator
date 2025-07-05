# Transaction Decorator

A modular transaction decorator library supporting multiple ORMs through adapter packages.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [@co88/transaction-decorator-core](./packages/core) | 0.0.3   | Core interfaces and decorator |
| [@co88/transaction-decorator-adapter-mongoose](./packages/adapter-mongoose) | 0.0.3   | Mongoose adapter |
| [@co88/transaction-decorator-adapter-prisma](./packages/adapter-prisma) | 0.0.3   | Prisma adapter |
| [@co88/transaction-decorator-adapter-typeorm](./packages/adapter-typeorm) | 0.0.3   | TypeORM adapter |

## Quick Start

### 1. Install Core + Adapter

Choose the adapter for your ORM:

```bash
# For Mongoose
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-mongoose mongoose

# For Prisma
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-prisma @prisma/client

# For TypeORM
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-typeorm typeorm
```

### 2. Setup 
Mongoose Example
```typescript
import { registerTransactionManager, Transactional } from '@co88/transaction-decorator-core';
import { MongooseTransactionManager, proxyConnection } from '@co88/transaction-decorator-adapter-mongoose';
import mongoose from 'mongoose';

// Setup connection
const connection = mongoose.connection;

// Register transaction manager
const transactionManager = new MongooseTransactionManager(connection);
registerTransactionManager('mongodb', transactionManager);

// Apply proxy to schema
const userSchema = new mongoose.Schema({ name: String });
proxyConnection(userSchema);
const User = mongoose.model('User', userSchema);
```

Typeorm Example

```typescript
import {DataSource} from "typeorm";
import {proxyDataSource} from "@cobb/transaction-decorator-adapter-typeorm";
import {registerTransactionManager} from "./container";
import {TypeOrmTransactionManager} from "./type-orm.transaction-manager";

// Setup datasource & Proxy to Datasource
const dataSource = new DataSource()
const proxiedDataSource = proxyDataSource(await datasource.initialize());

// Register transaction manager for typeorm
registerTransactionManager('typeorm', new TypeOrmTransactionManager(proxiedDataSource));

// Use Proxy Datasource
const userRepository = proxiedDataSource.getRepository(User);
const user = await this.userRepository.findOne({where: {id: id}});

```

### 3. Use Decorator

```typescript
class UserService {
  @Transactional('mongodb') // @Transactional('typeorm') // if use typeorm
  async createUser(userData: any) {
    // All operations within this method are automatically transactional
    const user = new User(userData);
    await user.save();
    return user;
  }
}
```

## Development

### Prerequisites

- Node.js >= 16
- npm >= 8

### Package Structure

```
packages/
├── core/                           # Core package
│     ├── types/                 # Common interfaces
│     ├── decorator/             # @Transactional decorator
│     ├── container/             # DI container
│     └── context/               # AsyncLocalStorage
├── adapter-mongoose/              # Mongoose adapter
│          ├── types/
│          ├── proxy/
│          └── mongoose.transaction-manager.ts
├── adapter-prisma/                # Prisma adapter
│   └── ...
└── adapter-typeorm/               # TypeORM adapter
    └── ...
```

## Architecture

### Benefits of Monorepo Structure

1. **Modular Installation**: Users only install what they need
2. **Independent Versioning**: Each adapter can be updated independently
3. **Consistent API**: All adapters share the same core interfaces
4. **Better Testing**: Centralized testing and CI/CD
5. **Code Sharing**: Common utilities in the core package

### How It Works

1. **Core Package**: Provides the `@Transactional` decorator and common interfaces
2. **Adapter Packages**: Implement ORM-specific transaction managers
3. **Proxy Pattern**: Each adapter uses proxy/middleware to inject transactions
4. **AsyncLocalStorage**: Maintains transaction context across async calls


## License

MIT
