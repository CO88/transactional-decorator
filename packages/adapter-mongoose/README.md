# @co88/transaction-decorator-adapter-mongoose

Mongoose adapter for transaction decorator.

## Installation

```bash
npm install @co88/transaction-decorator-core @co88/transaction-decorator-adapter-mongoose mongoose
```

## Usage

```typescript
import { registerTransactionManager, Transactional } from '@co88/transaction-decorator-core';
import { MongooseTransactionManager, proxyConnection } from '@co88/transaction-decorator-adapter-mongoose';
import mongoose from 'mongoose';

// Setup connection
const connection = mongoose.connection;

// Register transaction manager
const transactionManager = new MongooseTransactionManager(connection);
registerTransactionManager('mongodb', transactionManager);

// Apply proxy to your schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

proxyConnection(userSchema);
const User = mongoose.model('User', userSchema);

// Use in your services
class UserService {
  @Transactional('mongodb')
  async createUser(userData: any) {
    const user = new User(userData);
    await user.save(); // Automatically uses transaction
    return user;
  }
}
```

## License

MIT
