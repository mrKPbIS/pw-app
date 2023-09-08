import { randomUUID } from 'crypto';

export function mockEntityManager(users, transactions) {
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

export const RepositoryMock = jest.fn((T) => {
  let id = 1;
  return {
    T,
    findOne: jest.fn(() => { throw new Error('mock implementation'); }),
    findOneBy: jest.fn(() => { throw new Error('mock implementation'); }),
    findAndCount: jest.fn(() => { throw new Error('mock implementation'); }),
    create: (options) => ({ id: id++, ...options, }),
    save: jest.fn(),
    manager: 'mock implementation',
    __resetMockId: jest.fn(() => { id = 1; }),
  };
});

export function getMockedRepo(repo: jest.Mock, T: any) {
  const filtered = repo.mock.results.filter((res)=> res.value.T === T.name);
  if (filtered.length) {
    return filtered[0].value;
  } else {
    throw new Error('unable to get mock');
  }
}
