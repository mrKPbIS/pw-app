import { User } from '../entity/user';
import { getDataSource } from '../adapters/dataSource';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';

export class UserRepository {
  private repository: Repository<User>;
  constructor() {
    this.init();
  }

  async init() {
    this.repository = (await getDataSource()).getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.repository.findOneBy({
      email,
    });
    return user;
  }

  async createUser(userData) {
    const { email, name, rawPassword } = userData;
    const password = await hash(rawPassword, 10);
    const user = await this.repository.create({ email, name, password });
    await this.repository.save(user);
    return user;
  }

  async confirmPassword(user: User, password: string)  {
    return await compare(user.password, await (hash(password, 10)));
  }
}
