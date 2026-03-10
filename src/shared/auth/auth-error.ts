export class DealerAuthError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "DealerAuthError";
    this.statusCode = statusCode;
  }
}
