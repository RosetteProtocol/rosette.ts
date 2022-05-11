export class InvalidTransactionError extends Error {
  name = 'InvalidTransactionError';

  constructor(message = 'InvalidTransactionError') {
    super(message);
  }
}

export class NotFoundError extends Error {
  name = 'NotFoundError';

  constructor(message = "The resource couldn't be found") {
    super(message);
  }
}
