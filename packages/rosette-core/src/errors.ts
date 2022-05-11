export class DescriptionNotFoundError extends Error {
  name = 'DescriptionNotFoundError';

  constructor(message = "Couldn't find description for the given transaction") {
    super(message);
  }
}

export class UnsupportedNetworkError extends Error {
  name = 'UnsupportedNetworkError';

  constructor(message = 'The network is not supported') {
    super(message);
  }
}

export class ConnectionError extends Error {
  name = 'ConnectionError';

  constructor(
    message = 'An error happened while communicating with a remote server',
  ) {
    super(message);
  }
}

export class UnexpectedResultError extends Error {
  name = 'UnexpectedResultError';

  constructor(
    message = "The resource doesn't correspond to the expected result.",
  ) {
    super(message);
  }
}
