export class DataLoadError extends Error {
  public readonly source: string;
  public readonly originalError?: unknown;

  constructor(message: string, source: string, originalError?: unknown) {
    super(message);

    this.name = 'DataLoadError';
    this.source = source;
    this.originalError = originalError;
  }
}
