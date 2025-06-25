import * as mongoose from 'mongoose';
import {
  Aggregate,
  CallbackWithoutResultAndOptionalError,
  ClientSession,
  Document,
  Model,
  Query,
  Schema,
} from 'mongoose';

import { AlsService, TRANSACTION_SESSION } from '@co88/transaction-decorator-core';

const specials = {
  documentAndQueryMiddlewares: ['remove', 'updateOne', 'deleteOne'],
  modelMethods: ['bulkSave', 'bulkWrite', 'watch', 'distinct'],
} as const;
const middlewareGroups = {
  document: ['save', ...specials.documentAndQueryMiddlewares],
  query: [
    'count',
    'countDocuments',
    'deleteMany',
    'estimatedDocumentCount',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndRemove',
    'findOneAndReplace',
    'findOneAndUpdate',
    'replaceOne',
    'update',
    'updateMany',
    ...specials.documentAndQueryMiddlewares,
  ],
  aggregate: ['aggregate'],
  model: ['insertMany', ...specials.modelMethods],
} as const;

function applySeesion(this: any, next: CallbackWithoutResultAndOptionalError) {
  const session = AlsService.get<ClientSession>(TRANSACTION_SESSION);
  if (!session) {
    return next();
  }
  if (this instanceof Document) {
    this.$session() || this.$session(session);
  } else if (this instanceof Query) {
    this.getOptions().session || this.session(session);
  } else if (this instanceof Aggregate) {
    (this as any).options.session || this.session(session);
  }
  next();
}

function applySessionToModel(schema: Schema, method: string) {
  schema.statics[method] = function (...args: any) {
    const session = AlsService.get<ClientSession>(TRANSACTION_SESSION);
    if (!session) return;

    if (method === 'distinct') {
      return Model.distinct.apply(this, args).session(session);
    }

    const options = args[1] || {}; // method options parameter
    if (!options?.session) {
      args[1] = Object.assign(options, { session });
    }
    return (Model as any)[method].apply(this, args);
  };
}

/**
 * Using "Mongoose plugin", if there is a Session in AsyncLocalStorage,
 * it intercepts all operation and injects the session
 *
 * @param schema mongoose.Schema
 */
export function proxyConnection(schema: mongoose.Schema): void {
  middlewareGroups.aggregate.forEach((method: any) => {
    schema.pre(method, applySeesion);
  });
  middlewareGroups.document.forEach((method: any) => {
    schema.pre(method, { document: true, query: true }, applySeesion);
  });
  middlewareGroups.query.forEach((method: any) => {
    schema.pre(method, applySeesion);
  });
  middlewareGroups.model.forEach((method: any) => {
    applySessionToModel(schema, method);
  });
}
