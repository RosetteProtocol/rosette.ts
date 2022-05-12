export class DescriptionNotFoundError extends Error {
  name = 'DescriptionNotFoundError';

  constructor(message = "Couldn't find description for the given transaction") {
    super(message);
  }
}
