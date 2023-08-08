import { Router } from 'express';
import { NotFoundError } from '../middleware/errors.middleware';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { TransactionRepository } from './transaction.repository';

// TODO: validate requests fields. Create interfaces
const transactionRouter = Router();
const transactionRepository = new TransactionRepository();

transactionRouter.use(authorizationMiddleware);

transactionRouter.post('/', async (req: AuthorizedRequestInterface, res, next) => {
  const { recepient, amount } = req.body;
  const sender = req.user;
  try {
    await transactionRepository.createTransaction({
      amount,
      recipientId: recepient,
      senderId: sender.id,
    });
    res.send({
      success: true,
    });
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/', async (req: AuthorizedRequestInterface, res, next) => {
  const limit = typeof req.query['limit'] === 'string'? Number(req.query['limit']): 0;
  const offset = typeof req.query['offset'] === 'string'? Number(req.query['offset']): 0;
  try {
    const [transactions, count] = await transactionRepository.findTransactions(req.user, { limit, offset });
    res.send({
      success: true,
      data: {
        transactions,
        count,
      },
    });
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/:id', async (req: AuthorizedRequestInterface, res, next) => {
  const { id } = req.params;
  try {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    } else {
      res.send({
        success: true,
        data: transaction,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default transactionRouter;
