# @co88/transaction-decorator-adapter-typeorm

TypeORM adapter for transaction decorator.

## Installation

```bash
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-typeorm typeorm
```

## Usage

```typescript
import { registerTransactionManager, Transactional } from '@co88/transaction-decorator-core';
import { TypeormTransactionManager, proxyDataSource } from '@co88/transaction-decorator-adapter-typeorm';
import { DataSource } from 'typeorm';

// Setup data source
const dataSource = new DataSource({
  // your configuration
});

await dataSource.initialize();

// Apply proxy
const proxiedDataSource = proxyDataSource(dataSource);

// Register transaction manager
const transactionManager = new TypeormTransactionManager(dataSource);
registerTransactionManager('typeorm', transactionManager);

// Use in your services
class UserService {
  @Transactional('typeorm')
  async createUser(userData: any) {
    const userRepo = proxiedDataSource.getRepository(User);
    return await userRepo.save(userData); // Automatically uses transaction
  }
}
```

## License

MIT
