import type { MakeCase } from '../utils';

import type { Payment } from './snake';
import type { PaymentCamel } from './camel';

export type PaymentCase = MakeCase<Payment, PaymentCamel>;

export interface InputPaymentElementBase {
  elementId?: string;
  /** May be required for some payment gateways */
  returnUrl?: string;
  /** @optional called when the Element value changes */
  onChange?: (event: unknown) => void;
  /** @optional called when the Element is fully rendered */
  onReady?: (event: unknown) => void;
  /** @optional called when the Element gains focus */
  onFocus?: (event: unknown) => void;
  /** @optional called when the Element loses focus */
  onBlur?: (event: unknown) => void;
  /** @optional */
  onEscape?: (event: unknown) => void;
  /** @optional optional, called when the Element is clicked */
  onClick?: (event: unknown) => void;
  /** @optional called on card payment success */
  onSuccess?: (data?: unknown) => void;
  /** @optional called on card payment error */
  onError?: (error: Error) => void;
}

export interface InputPaymentElementCard extends InputPaymentElementBase {
  /** @see {@link https://docs.stripe.com/js/elements_object/create_element?type=card#elements_create-options} */
  options?: object;
  separateElements?: boolean;
  cardNumber?: {
    /** @default "#card-element" */
    elementId?: string;
    /** @see {@link https://docs.stripe.com/js/elements_object/create_element?type=cardNumber#elements_create-options} */
    options?: object;
  };
  cardExpiry?: {
    /** @default "#cardExpiry-element" */
    elementId?: string;
  };
  cardCvc?: {
    /** @default "#cardCvc-element" */
    elementId?: string;
  };
}

export interface InputPaymentElementIdeal extends InputPaymentElementBase {
  options?: {
    style?: unknown;
  };
}

export interface InputPaymentElementPaypal extends InputPaymentElementBase {
  /** @see {@link https://developer.paypal.com/docs/checkout/integration-features/customize-button} */
  style?: unknown;
}

export interface InputPaymentElementApple extends InputPaymentElementBase {
  style?: unknown;
  require?: {
    shipping?: boolean;
    name?: boolean;
    email?: boolean;
    phone?: boolean;
  };
  classes?: {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    invalid?: string;
    webkitAutofill?: string;
  };
}

export interface InputPaymentElementGoogle extends InputPaymentElementBase {
  locale?: string;
  style?: unknown;
  require?: {
    email?: boolean;
    shipping?: boolean;
    phone?: boolean;
  };
  classes?: {
    base?: string;
  };
}

export interface InputPaymentElementSezzle extends InputPaymentElementBase {
  /** @see {@link https://docs.sezzle.com/docs/guides/express/express-checkout#options-2} */
  style?: {
    /** @default "Checkout with %%logo%%" */
    templateText?: string;
    borderType?: 'square' | 'semi-rounded';
    customClass?: string;
    /** @default "1px" */
    paddingTop?: string;
    /** @default "7px" */
    paddingBottom?: string;
    /** @default "30px" */
    paddingLeft?: string;
    /** @default "30px" */
    paddingRight?: string;
    /** @default "84px" */
    sezzleImageWidth?: string;
    sezzleImagePositionTop?: string;
    sezzleImagePositionBottom?: string;
    sezzleImagePositionLeft?: string;
    sezzleImagePositionRight?: string;
    letterSpacing?: string;
    width?: string;
    /** @default "4.2em" */
    height?: string;
  };

  classes?: {
    base?: string;
  };
}

export interface InputPaymentRedirect {
  /** @optional called on card payment success */
  onSuccess?: (event: unknown) => void;
  /** @optional called on card payment error */
  onError?: (event: unknown) => void;
}

export type { Payment, PaymentCamel };
