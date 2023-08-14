import { Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { ForbiddenRequestError, NotFoundError, ValidationError } from '../middleware/errors.middleware';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { TransactionRepository } from './transaction.repository';

const transactionRouter = Router();
const transactionRepository = new TransactionRepository();

transactionRouter.use(authorizationMiddleware);

transactionRouter.post('/', checkSchema({
  recipient: {
    isNumeric: true,
    toInt: true,
    errorMessage: 'should be Int',
  },
  amount: {
    isString: true,
    isNumeric: true,
    errorMessage: 'should be decimal with 2 decimal digits',
    isDecimal: {
      options: {
        decimal_digits: '2',
      }
    }
  }
}, ['body']), async (req: AuthorizedRequestInterface, res, next) => {
  try {
    const validation = validationResult(req);
    if (!validation.isEmpty()) {
      throw new ValidationError(validation);
    }
    const { recipient, amount } = req.body;
    const sender = req.user;

    if (sender.id === recipient) {
      throw new ForbiddenRequestError('Not allowed to transfer to self');
    }

    await transactionRepository.createTransaction({
      amount,
      recipientId: recipient,
      senderId: sender.id,
    });
    res.send({
      success: true,
    });
  } catch (err) {
    next(err);
  }
});

transactionRouter.get('/', checkSchema({
  limit: {
    customSanitizer: {
      options: value => typeof value === 'string' && !Number.isNaN(Number(value))? Number(value): 0,
    },
  },
  offset: {
    customSanitizer: {
      options: value => typeof value === 'string' && !Number.isNaN(Number(value))? Number(value): 0,
    },
  },
}, ['query']), async (req: AuthorizedRequestInterface, res, next) => {
  try {
    const { limit, offset } = req.query;
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

transactionRouter.get('/:id', checkSchema({
  id: {
    isNumeric: true,
    toInt: true,
    errorMessage: 'should be Int',
  }
}, ['params']), async (req: AuthorizedRequestInterface, res, next) => {
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
