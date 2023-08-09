import { Result } from 'express-validator';

class BasicError extends Error {
  errorCode: number;
}

export class BadRequestError extends BasicError {
  constructor(message) {
    super();
    this.name = 'Bad Request Error';
    this.message = message;
    this.errorCode = 400;
  }
}

export class ValidationError extends BadRequestError {
  validationResult: Result;

  constructor(validationResult) {
    super('Validation error');
    this.validationResult = validationResult;
  }
}

export class UnauthorizedRequestError extends BasicError {
  errorCode: number;

  constructor(message) {
    super();
    this.name = 'Unauthorized Error';
    this.message = message;
    this.errorCode = 401;
  }
}

export class ForbiddenRequestError extends BasicError {
  errorCode: number;

  constructor(message) {
    super();
    this.name = 'Forbidden Request Error';
    this.message = message;
    this.errorCode = 403;
  }
}

export class NotFoundError extends BasicError {
  constructor(message) {
    super();
    this.name = 'Not Found Error';
    this.message = message;
    this.errorCode = 404;
  }
}

export class InternalError extends BasicError {
  constructor(message) {
    super();
    this.name = 'Internal Error';
    this.message = message;
    this.errorCode = 500;
  }
}

export async function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    const errors = err.validationResult.array();
    const messages = errors.map(({ path, msg }) => `Property "${path}" failed validation "${msg}"`);
    res.status(err.errorCode).send({
      success: false,
      error: {
        code: err.errorCode,
        message: messages.join(';'),
      }
    });
  } else if (err instanceof UnauthorizedRequestError
    || err instanceof BadRequestError
    || err instanceof ForbiddenRequestError
    || err instanceof NotFoundError) {
    res.status(err.errorCode).send({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  } else {
    // console.log(err);
    res.status(500).send({
      success: false,
      error: {
        code: 500,
        message: err.message
      }
    });
  }
}
