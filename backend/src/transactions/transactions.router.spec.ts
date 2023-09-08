import supertest from 'supertest';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';
import initApp from '../app';
import { Transaction } from '../entity/transaction';
import { User } from '../entity/user';
import { DEFAULT_STARTING_BALANCE } from '../common/balance';
import { getMockedRepo, mockEntityManager, RepositoryMock } from '../adapters/dataSource.mocks';

//  module mock don't work inside describe
jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mock default'),
    DataSource: jest.fn(() => ({
      initialize: jest.fn(),
      isInitialized: true,
      getRepository: jest.fn((T) => RepositoryMock(T)),
    })
    ),
  };
});

describe('Transaction router', () => {
  let requestWithSupertest;
  let mockedUserRepo, mockedTransactionRepo;

  beforeAll(async () => {
    const app = await initApp();
    requestWithSupertest = supertest(app);
    mockedUserRepo = getMockedRepo(RepositoryMock, User);
    mockedTransactionRepo = getMockedRepo(RepositoryMock, Transaction);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(() => {
    mockedUserRepo.__resetMockId();
    mockedTransactionRepo.__resetMockId();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

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
