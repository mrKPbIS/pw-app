import { User } from '../entity/user';
import { getDataSource } from '../adapters/dataSource';
import { Like, Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { UserCreateData, UserSearchParams } from './interfaces/user.interfaces';
import { DEFAULT_STARTING_BALANCE } from '../common/balance';

export class UserRepository {
  private repository: Repository<User>;
  constructor() {
    this.init();
  }

  async init() {
    console.log('User repository initialized');
    this.repository = (await getDataSource()).getRepository(User);
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({
      id,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({
      email,
    });
  }

  async findUsers(searchParams: UserSearchParams): Promise<[User[], number]> {
    const { name, limit, offset } = searchParams;
    return await this.repository.findAndCount({
      where: {
        name: Like(`%${name}%`),
      },
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });
  }

  async createUser(userData: UserCreateData): Promise<User> {
    const { email, name, rawPassword } = userData;
    const password = await hash(rawPassword, 10);
    const user = await this.repository.create({ email, name, password, balance: DEFAULT_STARTING_BALANCE });
    await this.repository.save(user);
    return user;
  }

  async confirmPassword(user: User, password: string): Promise<boolean>  {
    return await compare(user.password, await (hash(password, 10)));
  }
}
