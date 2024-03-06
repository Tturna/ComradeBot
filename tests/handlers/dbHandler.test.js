const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbHandler = require('../../handlers/dbHandler');
const UserModel = require('../../models/userschema');

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoServer.stop();
  await mongoose.disconnect();
});

describe('Database Handler', () => {
  it('User can be added', async () => {
    const nonExistent = await dbHandler.userExists('testuser');
    expect(nonExistent).toBe(false);

    const newGuy = await dbHandler.addUser('testuser');
    expect(newGuy).toBeDefined();

    const exists = await dbHandler.userExists('testuser');
    expect(exists).toBe(true);
  });

  it('User data can be updated and read', async () => {
    await dbHandler.addUser('testuser');
    await dbHandler.updateUserData('testuser', { balance: 420 });
    const data = await dbHandler.getUserData('testuser', {});
    expect(data).toBeDefined();
    expect(data.balance).toBe(420);
    expect(data.username).toBe('testuser');
  });
});
