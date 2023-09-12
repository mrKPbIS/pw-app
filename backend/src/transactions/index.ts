import { Repository } from 'typeorm';
import { Server } from 'socket.io';
import { Transaction } from '../entity/transaction';
import { TransactionService } from './transaction.repository';
import initTransactionRouter from './transaction.router';

export function transactionModule(transactionRepository: Repository<Transaction>, io: Server) {
  const transactionService = TransactionService.getInstance(transactionRepository);
  const transactionRouter = initTransactionRouter(transactionService, io);

  return { transactionRouter };
}
