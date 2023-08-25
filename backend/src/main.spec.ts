import supertest from 'supertest';
import app from './app';
import { Repository } from 'typeorm';

// TODO: mock DB requests
// DB connection creates on init when express application starts
// I need to mock repository methods in testcases
// I can't do it right now because I use functions and can't rewrite code of methods 

jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm');
  const DataSourceMock = {
    getRepository: jest.fn((T) => RepositoryMock(T)),
  };
  const RepositoryMock = jest.fn((T) => {
    let id = 1;
    return {
      findOneBy: () => { throw new Error('mock implementation'); },
      create: (options) => ({ id: id++, ...options, }),
      save: jest.fn(),
    };
  });
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(() => 'mock default'),
    DataSource: jest.fn(() => ({
      initialize: jest.fn(() => DataSourceMock),
    })
    ),
  };
});

describe('App', () => {
  let requestWithSupertest;
  beforeAll(async () => {
    requestWithSupertest = supertest(app);
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  // afterEach(() => {
  //   jest.clearAllMocks();
  // });

  it('should start application', async () => {
    const res = await requestWithSupertest.get('/ping');
    expect(res.status).toEqual(200);
    expect(res.text).toBe('pong');
  });

  describe('Auth router', () => {
    it('should register user', async () => {
      jest.spyOn(Repository.prototype, 'findOneBy').mockImplementation(() => null);
      const user = {
        email: 'test@test.com',
        password: '1qaz2wsx',
        name: 'test test',
      };
      const res = await requestWithSupertest.post('/api/auth/register')
        .send(user)
        .set('Accept', 'application/json');
      expect(res.status).toEqual(200);
      expect(res.body.success).toBeTruthy();
    });
  });

});

