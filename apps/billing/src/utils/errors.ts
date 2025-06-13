export class BillingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'BillingError';
    this.code = code;
    this.statusCode = statusCode;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, BillingError);
  }
}

export class StripeError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'StripeError';
    this.code = code;
    this.statusCode = statusCode;
    
    Error.captureStackTrace(this, StripeError);
  }
}

export class UsageError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = 'UsageError';
    this.code = code;
    this.statusCode = statusCode;
    
    Error.captureStackTrace(this, UsageError);
  }
}
