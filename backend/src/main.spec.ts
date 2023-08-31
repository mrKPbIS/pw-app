import supertest from 'supertest';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import initApp from './app';
import { Transaction } from './entity/transaction';
import { User } from './entity/user';
import { DEFAULT_STARTING_BALANCE } from './common/balance';

function mockEntityManager(users, transactions) {
  const entityManager = {
    transaction: jest.fn((level, cb) => cb(entityManager)),
    findOne: jest.fn(({ name }, { where }) => {
      const { id } = where;
      const filterFunc = (it) => it.id === id;
      if (name === 'User') {
        return users.filter(filterFunc)[0];
      } else {
        return transactions.filter(filterFunc)[0];
      }
    }),
    increment: jest.fn(),
    decrement: jest.fn(),
    create: jest.fn(({ name }, options) => {
      if (name === 'User') {
        users.push({ id: users.length+1, ...options });
        return users[users.length-1];
      } else {
        transactions.push({ id: randomUUID(), ...options });
        return transactions[transactions.length-1];
      }
    }),
    save: jest.fn(res => res),
  };
  return entityManager;
}

const RepositoryMock = jest.fn((T) => {
  let id = 1;
  return {
    T,
    findOne: jest.fn(() => { throw new Error('mock implementation'); }),
    findOneBy: jest.fn(() => { throw new Error('mock implementation'); }),
    findAndCount: jest.fn(() => { throw new Error('mock implementation'); }),
    create: (options) => ({ id: id++, ...options, }),
    save: jest.fn(),
    manager: 'mock implementation',
    __resetMockId: jest.fn(() => { id = 1; })
  };
});

//  module mock don't work inside describe
jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mock default'),
    DataSource: jest.fn(() => ({
      initialize: jest.fn(),
      getRepository: jest.fn((T) => RepositoryMock(T)),
    })
    ),
  };
});

function getMockedRepo(T: any) {
  const filtered = RepositoryMock.mock.results.filter((res)=> res.value.T === T.name);
  if (filtered.length) {
    return filtered[0].value;
  } else {
    throw new Error('unable to get mock');
  }
}

describe('App', () => {
  let requestWithSupertest;
  let mockedUserRepo, mockedTransactionRepo;

  beforeAll(async () => {
    const app = await initApp();
    requestWithSupertest = supertest(app);
    mockedUserRepo = getMockedRepo(User);
    mockedTransactionRepo = getMockedRepo(Transaction);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(() => {
    mockedUserRepo.__resetMockId();
    mockedTransactionRepo.__resetMockId();
  });

  it('should start application', async () => {
    const res = await requestWithSupertest.get('/ping');
    expect(res.status).toEqual(200);
    expect(res.text).toBe('pong');
  });

  describe('Auth router', () => {
    // TODO: mock token
    it('/register: should register user', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(() => null);
      const res = await requestWithSupertest.post('/api/auth/register')
        .send(user)
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });

    it('/register: should reject registration of already registered user', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(() => user);
      const res = await requestWithSupertest.post('/api/auth/register')
        .send(user)
        .set('Accept', 'application/json');
      expect(res.status).toEqual(403);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('User already registered');
    });

    it('/login: should login registered user', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10), }));
      const res = await requestWithSupertest.post('/api/auth/login')
        .send({ email: user.email, password: user.password })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });

    it('/login: should reject unregistered user', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(() => null);
      const res = await requestWithSupertest.post('/api/auth/login')
        .send({ email: user.email, password: user.password })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(404);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('User not found');
    });

    it('/login: should reject registered user with wrong password', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const res = await requestWithSupertest.post('/api/auth/login')
        .send({ email: user.email, password: 'not1qaz2wsx' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Password does not match');
    });

    it('/login: should reject request to authorized route without token', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);

      const res = await requestWithSupertest.get('/api/users')
        .set('Accept', 'application/json');
      expect(res.status).toEqual(401);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Request should include authorization header');
    });

    it('/login: should reject request to authorized route with broken token', async () => {
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);

      const res = await requestWithSupertest.get('/api/users')
        .auth('not token', { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(401);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Provided bearer token is broken');
    });
  });

  describe('User router', () => {
    it('/: should return list of users', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 3,
          name: 'd b',
          email: 'user3@mail.com',
          password: 'password3',
          balance: DEFAULT_STARTING_BALANCE,
        }
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      jest.spyOn(mockedUserRepo, 'findAndCount').mockImplementationOnce(() => [users, users.length]);
      const res = await requestWithSupertest.get('/api/users/')
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.users.length).toEqual(res.body.data.count);
      expect(res.body.data.users[0]).not.toMatchObject(users[0]);
      expect(res.body.data.users[0]).toMatchObject({
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
      });
    });

    it('/profile: should return user profile using token', async () => {
      const user = {
        id: 1,
        name: 'a b',
        email: 'user1@mail.com',
        password: 'password1',
        balance: DEFAULT_STARTING_BALANCE,
      };
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }))
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get('/api/users/profile')
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).not.toMatchObject(user);
      expect(res.body.data).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
      });
    });

    it('/:id: should return user by id', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 3,
          name: 'd b',
          email: 'user3@mail.com',
          password: 'password3',
          balance: DEFAULT_STARTING_BALANCE,
        }
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }))
        .mockImplementationOnce(async ({ id }) => { const user = users.filter(it => it.id === id)[0]; return { ...user, password: await hash(user.password, 10) }; });
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get('/api/users/2')
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toMatchObject({ id: users[1].id, name: users[1].name, email: users[1].email, balance: users[1].balance });
    });

    it('/:id: should reject search of non-existent user', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 3,
          name: 'd b',
          email: 'user3@mail.com',
          password: 'password3',
          balance: DEFAULT_STARTING_BALANCE,
        }
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }))
        .mockImplementationOnce(() => null);
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get('/api/users/20')
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(404);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('User not found');
    });
  });

  describe('Transaction router', () => {
    it('/: should return transactions list', async () => {
      const user = {
        id: 1,
        name: 'a b',
        email: 'user1@mail.com',
        password: 'password1',
        balance: DEFAULT_STARTING_BALANCE,
      };
      const transactions = [
        {
          id: 'some-id',
          ownerId: 1,
          recipientId: 2,
          amount: '10.00',
          amountAfter: '490.00',
        },
        {
          id: 'some-id2',
          ownerId: 1,
          recipientId: 2,
          amount: '15.00',
          amountAfter: '475.00',
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      jest.spyOn(mockedTransactionRepo, 'findAndCount')
        .mockImplementationOnce(() => [transactions, transactions.length]);
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get('/api/transactions')
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data.transactions.length).toEqual(res.body.data.count);
    });

    it('/:id: should return transaction by id', async () => {
      const user = {
        id: 1,
        name: 'a b',
        email: 'user1@mail.com',
        password: 'password1',
        balance: DEFAULT_STARTING_BALANCE,
      };
      const transactions = [
        {
          id: randomUUID(),
          ownerId: 1,
          recipientId: 2,
          amount: '10.00',
          amountAfter: '490.00',
        },
        {
          id: randomUUID(),
          ownerId: 1,
          recipientId: 2,
          amount: '15.00',
          amountAfter: '475.00',
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      jest.spyOn(mockedTransactionRepo, 'findOne')
        .mockImplementationOnce(async ({ where }) => {
          const { id } = where;
          const transaction = transactions.filter(it => it.id === id)[0];
          return transaction;
        });
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get(`/api/transactions/${transactions[1].id}`)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
      expect(res.body.data).toMatchObject(transactions[1]);
    });

    it('/:id: should reject if id is not uuid', async () => {
      const user = {
        id: 1,
        name: 'a b',
        email: 'user1@mail.com',
        password: 'password1',
        balance: DEFAULT_STARTING_BALANCE,
      };
      const transactions = [
        {
          id: 'not-uuid',
          ownerId: 1,
          recipientId: 2,
          amount: '10.00',
          amountAfter: '490.00',
        },
        {
          id: 'not-uuid',
          ownerId: 1,
          recipientId: 2,
          amount: '15.00',
          amountAfter: '475.00',
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const res = await requestWithSupertest.get(`/api/transactions/${transactions[0].id}`)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Property "id" failed validation "should be UUID"');
    });

    it('/:id: should reject if there is no transaction', async () => {
      const user = {
        id: 1,
        name: 'a b',
        email: 'user1@mail.com',
        password: 'password1',
        balance: DEFAULT_STARTING_BALANCE,
      };
      const transactions = [
        {
          id: randomUUID(),
          ownerId: 1,
          recipientId: 2,
          amount: '10.00',
          amountAfter: '490.00',
        },
        {
          id: randomUUID(),
          ownerId: 1,
          recipientId: 2,
          amount: '15.00',
          amountAfter: '475.00',
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(user)
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      jest.spyOn(mockedTransactionRepo, 'findOne').mockImplementationOnce(() => null);
      const res = await requestWithSupertest.get(`/api/transactions/${transactions[0].id}`)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(404);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Transaction not found');
    });

    it('/: should create transaction', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const transactionRequest = {
        amount: '10.00',
        recipientId: 2,
      };
      const managerMock = mockEntityManager(users, []);
      jest.replaceProperty(mockedTransactionRepo, 'manager', managerMock);
      const res = await requestWithSupertest.post('/api/transactions')
        .send(transactionRequest)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });

    it('/: should reject if recepient is the same user', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const transactionRequest = {
        amount: '10.00',
        recipientId: 1,
      };
      const managerMock = mockEntityManager(users, []);
      jest.replaceProperty(mockedTransactionRepo, 'manager', managerMock);
      const res = await requestWithSupertest.post('/api/transactions')
        .send(transactionRequest)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(403);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Not allowed to transfer to self');
    });

    it('/: should reject if balance lower than amount', async () => {
      const users = [
        {
          id: 1,
          name: 'a b',
          email: 'user1@mail.com',
          password: 'password1',
          balance: DEFAULT_STARTING_BALANCE,
        },
        {
          id: 2,
          name: 'a c',
          email: 'user2@mail.com',
          password: 'password2',
          balance: DEFAULT_STARTING_BALANCE,
        },
      ];
      jest.spyOn(mockedUserRepo, 'findOneBy')
        .mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }));
      const auth = await requestWithSupertest.post('/api/auth/login')
        .send(users[0])
        .set('Accept', 'application/json');
      expect(auth.status).toEqual(200);
      const transactionRequest = {
        amount: '1000.00',
        recipientId: 2,
      };
      const managerMock = mockEntityManager(users, []);
      jest.replaceProperty(mockedTransactionRepo, 'manager', managerMock);
      const res = await requestWithSupertest.post('/api/transactions')
        .send(transactionRequest)
        .auth(auth.body.data, { type: 'bearer' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Incorrect amount value');
    });
  });
});

