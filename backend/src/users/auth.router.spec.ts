import supertest from 'supertest';
import { hash } from 'bcryptjs';
import initApp from '../app';
import { Transaction } from '../entity/transaction';
import { User } from '../entity/user';
import { getMockedRepo, RepositoryMock } from '../adapters/dataSource.mocks';

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

describe('Auth router', () => {
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
