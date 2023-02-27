export class PaymentMethodDisabledError extends Error {
  constructor(method) {
    const message = `${method} payments are disabled. See Payment settings in the Swell dashboard for details`;
    super(message);
  }
}

export class UnsupportedPaymentMethodError extends Error {
  constructor(method, gateway) {
    let message = `Unsupported payment method: ${method}`;

    if (gateway) {
      message += ` (${gateway})`;
    }

    super(message);
  }
}

export class UnsupportedPaymentGatewayError extends Error {
  constructor(gateway) {
    const message = `Unsupported payment gateway: ${gateway}`;
    super(message);
  }
}

export class UnableAuthenticatePaymentMethodError extends Error {
  constructor() {
    const message =
      'We are unable to authenticate your payment method. Please choose a different payment method and try again';
    super(message);
  }
}

export class LibraryNotLoaded extends Error {
  constructor(library) {
    const message = `${library} was not loaded`;
    super(message);
  }
}
