import { Router } from 'express';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { TransactionRepository } from './transaction.repository';

// TODO: validate requests fields. Create interfaces
const transactionRouter = Router();

const transactionRepository = new TransactionRepository();


transactionRouter.use(authorizationMiddleware);

transactionRouter.post('/', async (req: AuthorizedRequestInterface, res) => {
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
    res.sendStatus(500);
  }
});

transactionRouter.get('/', async (req: AuthorizedRequestInterface, res) => {
  const limit = typeof req.query['limit'] === 'string'? Number(req.query['limit']): 0;
  const offset = typeof req.query['offset'] === 'string'? Number(req.query['offset']): 0;
  const [transactions, count] = await transactionRepository.findTransactions(req.user, { limit, offset });
  res.send({
    success: true,
    data: {
      transactions,
      count,
    },
  });
});

transactionRouter.get('/:id', async (req: AuthorizedRequestInterface, res) => {
  const { id } = req.params;
  const transaction = await transactionRepository.findById(id);
  if (!transaction) {
    res.sendStatus(404);
  } else {
    res.send({
      success: true,
      data: transaction,
    });
  }
});

export default transactionRouter;
