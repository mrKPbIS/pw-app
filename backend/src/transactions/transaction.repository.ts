import { User } from '../entity/user';
import { Repository } from 'typeorm';
import { getDataSource } from '../adapters/dataSource';
import { Transaction } from '../entity/transaction';
import { TransactionCreateData, TransctionSearchParams } from './interfaces/transaction.interfaces';
import { compareBalance, incrementBalance, substractBalance } from '../common/balance';

export class TransactionRepository {
  private repository: Repository<Transaction>;
  constructor() {
    this.init();
  }

  // TODO: fix multiple inits
  async init() {
    console.log('Transaction repository initialized');
    this.repository = (await getDataSource()).getRepository(Transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.repository.findOneBy({ id });
  }

  async findTransactions(user: User, searchParams: TransctionSearchParams): Promise<[Transaction[], number]> {
    const { limit, offset } = searchParams;
    return await this.repository.findAndCount({
      where: {
        ownerId: user.id,
      },
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });
  }

  async createTransaction(transactionCreateData: TransactionCreateData): Promise<void> {
    const manager = this.repository.manager;
    await manager.transaction('READ UNCOMMITTED',
      async (entityManager) => {
        const sender = await entityManager.findOneBy(User, { id: transactionCreateData.senderId });
        const recepient = await entityManager.findOneBy(User, { id: transactionCreateData.recipientId });
        if (!sender || !recepient || !compareBalance(sender.balance, transactionCreateData.amount)) {
          throw new Error('unable to create transaction');
        }
        const senderBalance = substractBalance(sender.balance, transactionCreateData.amount);
        const recepientBalance = incrementBalance(recepient.balance, transactionCreateData.amount);
        await entityManager.update(User, { id: sender.id }, { balance: senderBalance });
        await entityManager.update(User, { id: recepient.id }, { balance: recepientBalance });
        const transaction = entityManager.create(Transaction, {
          ownerId: sender.id,
          recepientId: recepient.id,
          amount: transactionCreateData.amount,
          amountAfter: senderBalance,
        });
        await entityManager.save(transaction);
      }
    );
  }
}
