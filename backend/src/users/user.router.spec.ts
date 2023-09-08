import supertest from 'supertest';
import { hash } from 'bcryptjs';
import initApp from '../app';
import { Transaction } from '../entity/transaction';
import { User } from '../entity/user';
import { getMockedRepo, RepositoryMock } from '../adapters/dataSource.mocks';
import { DEFAULT_STARTING_BALANCE } from '../common/balance';

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

describe('User router', () => {
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
