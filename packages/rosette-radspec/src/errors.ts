export class InvalidTransactionError extends Error {
  name = 'InvalidTransactionError';

  constructor(message = 'InvalidTransactionError') {
    super(message);
  }
}
