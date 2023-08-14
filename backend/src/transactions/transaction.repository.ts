import { User } from '../entity/user';
import { Repository } from 'typeorm';
import { initDataSource } from '../adapters/dataSource';
import { Transaction } from '../entity/transaction';
import { TransactionCreateData, TransctionSearchParams } from './interfaces/transaction.interfaces';
import { compareBalance, incrementBalance, substractBalance } from '../common/balance';

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
        const recipient = await entityManager.findOneBy(User, { id: transactionCreateData.recipientId });
        if (!sender || !recipient || !compareBalance(sender.balance, transactionCreateData.amount)) {
          throw new Error('unable to create transaction');
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
        await entityManager.save(transaction);
      }
    );
  }
}
