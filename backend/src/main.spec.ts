import supertest from 'supertest';
import { hash } from 'bcryptjs';
import initApp from './app';
import { Transaction } from './entity/transaction';
import { User } from './entity/user';
import { DEFAULT_STARTING_BALANCE } from './common/balance';

const RepositoryMock = jest.fn((T) => {
  let id = 1;
  return {
    T,
    findOneBy: jest.fn(() => { throw new Error('mock implementation'); }),
    findAndCount: jest.fn(() => { throw new Error('mock implementation'); }),
    create: (options) => ({ id: id++, ...options, }),
    save: jest.fn(),
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
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10),  }));
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
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(async () => ({ ...user, password: await hash(user.password, 10),  }));
      const res = await requestWithSupertest.post('/api/auth/login')
        .send({ email: user.email, password: 'not1qaz2wsx' })
        .set('Accept', 'application/json');
      expect(res.status).toEqual(400);
      expect(res.body.success).toBeFalsy();
      expect(res.body.error.message).toBe('Password does not match');
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
      jest.spyOn(mockedUserRepo, 'findOneBy').mockImplementationOnce(async () => ({ ...users[0], password: await hash(users[0].password, 10) }));
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
      expect(res.body.data).toMatchObject({ id: user.id, name: user.name, email: user.email, balance: user.balance });
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
  });

});
