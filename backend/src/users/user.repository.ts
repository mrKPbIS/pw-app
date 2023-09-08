import { Like, Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { User } from '../entity/user';
import { DEFAULT_STARTING_BALANCE } from '../common/balance';
import { UserCreateData, UserSearchParams } from './interfaces/user.interfaces';

export class UserService {
  private static instance: UserService;
  repository: Repository<User>;

  public static getInstance(repository: Repository<User>) {
    if (!UserService.instance) {
      UserService.instance = new UserService(repository);
    }
    return UserService.instance;
  }

  private constructor(repository: Repository<User>) {
    this.repository = repository;
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
