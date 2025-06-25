// Basic transaction option type - adapters can extend this
export type BaseTransactionOption = Record<string, any>;

// Generic transaction option type that adapters can specialize
export type TransactionOption = BaseTransactionOption;
