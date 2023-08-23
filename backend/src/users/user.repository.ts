import { Like, Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { initDataSource } from '../adapters/dataSource';
import { User } from '../entity/user';
import { DEFAULT_STARTING_BALANCE } from '../common/balance';
import { UserCreateData, UserSearchParams } from './interfaces/user.interfaces';

export class UserRepository {
  private static instance: UserRepository;
  private repository: Repository<User> | null;

  public static getInstance() {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  private constructor() {
    this.init();
  }

  private async init() {
    this.repository = (await initDataSource()).getRepository(User);
    console.log('User repository initialized');
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
    return compare(password, user.password);
  }
}
