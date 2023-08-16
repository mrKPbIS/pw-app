import { User } from '../entity/user';
import { FindOptionsOrder, Repository } from 'typeorm';
import { initDataSource } from '../adapters/dataSource';
import { Transaction } from '../entity/transaction';
import { TransactionCreateData, TransctionSearchParams } from './interfaces/transaction.interfaces';
import { compareBalance, incrementBalance, substractBalance } from '../common/balance';
import { BadRequestError } from '../middleware/errors.middleware';

export class TransactionRepository {
  private repository: Repository<Transaction>;
  constructor() {
    this.init();
  }

  async init() {
    this.repository = (await initDataSource()).getRepository(Transaction);
    console.log('Transaction repository initialized');
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOne({
      where: { id },
      relations: {
        owner: true,
        recipient: true,
      },
    });
  }

  async findTransactions(user: User, searchParams: TransctionSearchParams): Promise<[Transaction[], number]> {
    const { limit, offset, sort } = searchParams;
    const sortOrder: FindOptionsOrder<Transaction> = this.createSortOrder(sort[0], sort[1]);
    return await this.repository.findAndCount({
      where: {
        ownerId: user.id,
      },
      order: sortOrder,
      relations: {
        owner: true,
        recipient: true,
      },
      skip: offset,
      take: limit,
    });
  }

  async createTransaction(transactionCreateData: TransactionCreateData): Promise<Transaction> {
    const manager = this.repository.manager;
    return await manager.transaction('READ UNCOMMITTED',
      async (entityManager) => {
        const sender = await entityManager.findOneBy(User, { id: transactionCreateData.senderId });
        const recipient = await entityManager.findOneBy(User, { id: transactionCreateData.recipientId });
        if (!sender || !recipient) {
          throw new BadRequestError('Unable to find user');
        }
        if (!compareBalance(sender.balance, transactionCreateData.amount)) {
          throw new BadRequestError('Incorrect amount value');
        }
        const senderBalance = substractBalance(sender.balance, transactionCreateData.amount);
        const recipientBalance = incrementBalance(recipient.balance, transactionCreateData.amount);
        await entityManager.update(User, { id: sender.id }, { balance: senderBalance });
        await entityManager.update(User, { id: recipient.id }, { balance: recipientBalance });
        const transaction = entityManager.create(Transaction, {
          ownerId: sender.id,
          recipientId: recipient.id,
          amount: transactionCreateData.amount,
          amountAfter: senderBalance,
        });
        return await entityManager.save(transaction);
      }
    );
  }

  private createSortOrder(key, value) {
    const [first, ...rest] = key.split('.');
    if (first === key) {
      return { [key]: value };
    } else {
      return { [first]: this.createSortOrder(rest.join('.'), value) };
    }
  }
}
