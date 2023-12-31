import { User } from '../entity/user';
import { FindOptionsOrder, PropertyType, Repository, In } from 'typeorm';
import { Transaction } from '../entity/transaction';
import { TransactionCreateData, TransctionSearchParams } from './interfaces/transaction.interfaces';
import { BadRequestError } from '../middleware/errors.middleware';
import { compareBalance } from '../common/balance';

export class TransactionService {
  private static instance: TransactionService;
  private repository: Repository<Transaction>;

  public static getInstance(repository: Repository<Transaction>) {
    if (!TransactionService.instance) {
      TransactionService.instance = new TransactionService(repository);
    }
    return TransactionService.instance;
  }

  private constructor(
    repository: Repository<Transaction>,
  ) {
    this.repository = repository;
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

  async findTransactions(userId: PropertyType<User, 'id'>, searchParams: TransctionSearchParams): Promise<[Transaction[], number]> {
    const { limit, offset, sort } = searchParams;
    let sortOrder: FindOptionsOrder<Transaction> = { createdAt: 'DESC' };
    if (sort.length !== 0) {
      sortOrder = this.createSortOrder(sort[0], sort[1]);
    }
    return await this.repository.findAndCount({
      where:
        [
          { ownerId: userId },
          { recipientId: userId },
        ],
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
    return await manager.transaction('READ COMMITTED',
      async (entityManager) => {
        const sender = await entityManager.findOne(User, { where : { id: transactionCreateData.senderId }, lock: { mode: 'pessimistic_write' } });
        const recipient = await entityManager.findOne(User, { where : { id: transactionCreateData.recipientId }, lock: { mode: 'pessimistic_write' } });
        if (!sender || !recipient) {
          throw new BadRequestError('Unable to find user');
        }
        if (!compareBalance(sender.balance, transactionCreateData.amount)) {
          throw new BadRequestError('Incorrect amount value');
        }
        await entityManager.increment(User, { id: recipient.id }, 'balance', transactionCreateData.amount);
        await entityManager.decrement(User, { id: sender.id }, 'balance', transactionCreateData.amount);

        const updatedBalance = await entityManager.find(User, {
          select: {
            id: true,
            balance: true,
          },
          where: {
            id: In([recipient.id, sender.id]),
          },
        });
        const transaction = entityManager.create(Transaction, {
          ownerId: sender.id,
          recipientId: recipient.id,
          amount: transactionCreateData.amount,
          ownerBalance: updatedBalance.filter(({ id }) => id === sender.id)[0].balance,
          recipientBalance: updatedBalance.filter(({ id }) => id === recipient.id)[0].balance,
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
