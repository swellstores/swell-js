import type { BaseModel, ResultsResponse } from '../index';

import type { Account } from '../account';
import type { Subscription } from '../subscription';
import type { Giftcard } from '../giftcard';
import type { Invoice } from '../invoice';
import type { Refund } from '../refund';
import type { Order } from '../order';
import type { Card } from '../card';

export interface Payment extends BaseModel {
  account?: Account;
  account_id?: string;
  account_card?: Card;
  account_card_id?: string;
  amazon?: object;
  amount: number;
  amount_refundable?: number;
  amount_refunded?: number;
  async?: boolean;
  authorized?: boolean;
  captured?: boolean;
  card?: Card;
  currency?: string;
  currency_rate?: number;
  date_async_update?: string;
  error?: object;
  gateway?: string;
  giftcard?: Giftcard;
  giftcard_id?: string;
  intent?: object;
  invoice?: Invoice;
  invoice_id?: string;
  method: string;
  number?: string;
  order?: Order;
  order_id?: string;
  paypal?: object; // TODO: Add Paypal Object
  refunds?: ResultsResponse<Refund>;
  status?: 'pending' | 'error' | 'success' | 'authorized';
  subscription?: Subscription;
  subscription_id?: string;
  success?: boolean;
  test?: boolean;
  transaction_id?: string;
}

export interface InputPaymentElementBase {
  element_id?: string;
  /** @optional called when the Element value changes */
  on_change?: (event: unknown) => void;
  /** @optional called when the Element is fully rendered */
  on_ready?: (event: unknown) => void;
  /** @optional called when the Element gains focus */
  on_focus?: (event: unknown) => void;
  /** @optional called when the Element loses focus */
  on_blur?: (event: unknown) => void;
  /** @optional */
  on_escape?: (event: unknown) => void;
  /** @optional optional, called when the Element is clicked */
  on_click?: (event: unknown) => void;
  /** @optional called on card payment success */
  on_success?: (event: unknown) => void;
  /** @optional called on card payment error */
  on_error?: (event: unknown) => void;
}

export interface InputPaymentElementCard extends InputPaymentElementBase {
  /** @see {@link https://docs.stripe.com/js/elements_object/create_element?type=card#elements_create-options} */
  options?: object;
  separate_elements?: boolean;
  card_number?: {
    /** @default "#card-element" */
    elementId?: string;
    /** @see {@link https://docs.stripe.com/js/elements_object/create_element?type=cardNumber#elements_create-options} */
    options?: object;
  };
  card_expiry?: {
    /** @default "#cardExpiry-element" */
    elementId?: string;
  };
  card_cvc?: {
    /** @default #cardCvc-element */
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
    webkit_autofill?: string;
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

export interface InputPaymentRedirect {
  /** @optional called on card payment success */
  on_success?: (event: unknown) => void;
  /** @optional called on card payment error */
  on_error?: (event: unknown) => void;
}
