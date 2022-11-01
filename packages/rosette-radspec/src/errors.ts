export class InvalidTransactionError extends Error {
  name = 'InvalidTransactionError';

  constructor(message: string) {
    super(message);
  }
}

export class RadspecHelperError extends Error {
  name = 'RadspecHelperError';
  constructor(helperName: string, message: string) {
    super(`@${helperName}: ${message}`);
  }
}
