import { Router } from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { plainToClass } from 'class-transformer';
import { Server } from 'socket.io';
import { ForbiddenRequestError, NotFoundError, ValidationError } from '../middleware/errors.middleware';
import { authorizationMiddleware, AuthorizedRequestInterface } from '../middleware/authorization.middleware';
import { TransactionService } from './transaction.repository';
import { GetTransactionsResponse } from './dto/getTransactionsResponse.dto';

export default function(transactionService: TransactionService, io: Server): Router {
  const transactionRouter = Router();

  transactionRouter.use(authorizationMiddleware);

  transactionRouter.post('/', checkSchema({
    recipientId: {
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
          force_decimal: true,
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
      const { recipientId, amount } = req.body;
      const senderId = req.user.id;

      if (senderId === recipientId) {
        throw new ForbiddenRequestError('Not allowed to transfer to self');
      }

      const transaction = await transactionService.createTransaction({
        amount,
        recipientId,
        senderId,
      });
      io.emit('transaction', transaction);
      res.send({
        success: true,
        data: plainToClass(GetTransactionsResponse, transaction, { excludeExtraneousValues: true }),
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
    sort: {
      customSanitizer: {
        options: value => {
          if (typeof value !== 'string') {
            return [];
          } else {
            const sort = value.split(':');
            return sort.length === 2? sort: [];
          }
        }
      }
    }
  }, ['query']), async (req: AuthorizedRequestInterface, res, next) => {
    try {
      const validation = validationResult(req);
      if (!validation.isEmpty()) {
        throw new ValidationError(validation);
      }
      const { limit, offset, sort } = req.query;
      const [transactions, count] = await transactionService.findTransactions(req.user.id, { limit, offset, sort });
      res.send({
        success: true,
        data: {
          transactions: transactions.map(transaction => plainToClass(GetTransactionsResponse, transaction, { excludeExtraneousValues: true })),
          count,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  transactionRouter.get('/:id', checkSchema({
    id: {
      isUUID: true,
      errorMessage: 'should be UUID',
    }
  }, ['params']), async (req: AuthorizedRequestInterface, res, next) => {
    try {
      const validation = validationResult(req);
      if (!validation.isEmpty()) {
        throw new ValidationError(validation);
      }
      const { id } = req.params;
      const transaction = await transactionService.findById(id);
      if (!transaction) {
        throw new NotFoundError('Transaction not found');
      } else {
        res.send({
          success: true,
          data: plainToClass(GetTransactionsResponse, transaction, { excludeExtraneousValues: true }),
        });
      }
    } catch (err) {
      next(err);
    }
  });

  return transactionRouter;
}
