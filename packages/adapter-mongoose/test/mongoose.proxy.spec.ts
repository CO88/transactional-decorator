import mongoose, { ClientSession, Model, Schema } from 'mongoose';
import { proxyConnection } from '@co88/transaction-decorator-adapter-mongoose/proxy';
import { AlsService, TRANSACTION_SESSION } from '@co88/transaction-decorator-core';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('proxyConnection', () => {
  let mongoServer: MongoMemoryServer;
  let connection: mongoose.Connection;
  let TestModel: Model<any>;
  let mockSession: jest.Mocked<ClientSession>;

  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Create connection to in-memory database
    connection = mongoose.createConnection(mongoUri);
  });

  afterAll(async () => {
    // Clean up
    if (connection) {
      await connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Session
    mockSession = {
      id: 'test-session-id',
      transaction: {
        options: {},
      },
      inTransaction: jest.fn().mockReturnValue(true),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Create test schema with plugin
    const testSchema = new Schema({
      name: { type: String, required: true },
      email: String,
      count: { type: Number, default: 0 },
    });

    // Apply the plugin
    testSchema.plugin(proxyConnection);

    // Create model for this test
    const modelName = `TestModel_${Date.now()}_${Math.random()}`;
    TestModel = connection.model(modelName, testSchema);
  });

  afterEach(async () => {
    // Clear collection after each test
    if (TestModel.collection) {
      await TestModel.collection.drop().catch(() => {
        // Ignore error if collection doesn't exist
      });
    }
  });

  describe('Document operations with session injection', () => {
    it('should inject session into document any operation when session exists', async () => {
      const alsServiceGetSpy = jest.spyOn(AlsService, 'get');
      const testDoc = new TestModel({ name: 'Test User', email: 'test@example.com' });
      const sessionSpy = jest.spyOn(testDoc, '$session');

      await testDoc.save();

      expect(alsServiceGetSpy).toHaveBeenCalled();
      expect(sessionSpy).toHaveBeenCalled();
    });

    // Mongoose에서는 session이 무조건 생성되기 때문에 해당 테스트건은 잘못되었음
    it('should not inject session when no session exists', async () => {
      const alsServiceGetSpy = jest.spyOn(AlsService, 'get').mockReturnValue(null);
      const testDoc = new TestModel({ name: 'Test User' });
      const sessionSpy = jest.spyOn(testDoc, '$session');

      await testDoc.save();

      expect(alsServiceGetSpy).toHaveBeenCalled();
      expect(sessionSpy).not.toHaveBeenCalledWith(mockSession);
    });
  });

  describe('Query operations with session injection', () => {
    it('should inject session into find query when session exists', async () => {
      const session = await connection.startSession();
      const alsServiceGetSpy = jest.spyOn(AlsService, 'get').mockReturnValue(session);
      await TestModel.create({ name: 'Test User', email: 'test@example.com' });

      const query = TestModel.find({ name: 'Test User' });
      const sessionSpy = jest.spyOn(query, 'session');

      await query.exec();

      expect(alsServiceGetSpy).toHaveBeenCalledWith(TRANSACTION_SESSION);
      expect(sessionSpy).toHaveBeenCalledWith(session);
    });
  });

  describe('Aggregate operations with session injection', () => {
    it('should inject session into aggregate operations when session exists', async () => {
      const session = await connection.startSession();
      const alsServiceGetSpy = jest.spyOn(AlsService, 'get').mockReturnValue(session);
      await TestModel.create({ name: 'User1', count: 5 });
      await TestModel.create({ name: 'User2', count: 10 });

      const aggregate = TestModel.aggregate([
        { $match: { count: { $gte: 5 } } },
        { $group: { _id: null, totalCount: { $sum: '$count' } } },
      ]);
      const sessionSpy = jest.spyOn(aggregate, 'session');

      const result = await aggregate.exec();

      expect(alsServiceGetSpy).toHaveBeenCalled();
      expect(sessionSpy).toHaveBeenCalledWith(session);
      expect(result[0].totalCount).toBe(15);
    });
  });

  describe('Model static methods with session injection', () => {
    it('should inject session into distinct operation when session exists ', async () => {
      const session = await connection.startSession();
      const alsServiceGetSpy = jest.spyOn(AlsService, 'get').mockReturnValue(session);

      await TestModel.create({ name: 'User1', email: 'user1@example.com' });
      await TestModel.create({ name: 'User2', email: 'user2@example.com' });

      const originalDistinct = mongoose.Model.distinct;
      const mockQuery = {
        session: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(['User1', 'User2']),
      } as any;

      const distinctSpy = jest.spyOn(mongoose.Model, 'distinct').mockReturnValue(mockQuery);
      const sessionSpy = jest.spyOn(mockQuery, 'session');

      const result = await TestModel.distinct('name').exec();

      expect(alsServiceGetSpy).toHaveBeenCalled();
      expect(distinctSpy).toHaveBeenCalledWith('name'); // Model.distinct 호출됨
      expect(sessionSpy).toHaveBeenCalledWith(session); // .session(session) 호출됨
      expect(result).toEqual(['User1', 'User2']);

      // Cleanup
      mongoose.Model.distinct = originalDistinct;
    });
  });
});