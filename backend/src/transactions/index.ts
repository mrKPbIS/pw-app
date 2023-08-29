import { Repository } from 'typeorm';
import { Transaction } from '../entity/transaction';
import { TransactionService } from './transaction.repository';
import initTransactionRouter from './transaction.router';

export function transactionModule(transactionRepository: Repository<Transaction>) {
  const transactionService = TransactionService.getInstance(transactionRepository);
  const transactionRouter = initTransactionRouter(transactionService);

  return { transactionRouter };
}
