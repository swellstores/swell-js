import { Account } from '../account';
import { Card } from '../card';
import { BaseModel } from '../index';
import { Invoice } from '../invoice';
import { Order } from '../order';
import { Refund } from '../refund';
import { Subscription } from '../subscription';

interface PaymentSnake extends BaseModel {
  account?: Account;
  account_card?: object; // TODO: Account Card
  account_card_id?: string;
  account_id?: string;
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
  giftcard?: object; // TODO: Add Gift Card
  giftcard_id?: string;
  intent?: object;
  invoice?: Invoice;
  invoice_id?: string;
  method: string;
  number?: string;
  order?: Order;
  order_id?: string;
  paypal?: object; //TODO: Add Paypal Object
  refunds?: Refund[];
  status?: 'pending' | 'error' | 'success' | 'authorized';
  subscription?: Subscription;
  subscription_id?: string;
  success?: boolean;
  test?: boolean;
  transaction_id?: string;
}

interface InputPaymentElementBaseSnake {
  element_id?: string;
  on_change?: (event: unknown) => void; // optional, called when the Element value changes
  on_ready?: (event: unknown) => void; // optional, called when the Element is fully rendered
  on_focus?: (event: unknown) => void; // optional, called when the Element gains focus
  on_blur?: (event: unknown) => void; // optional, called when the Element loses focus
  on_escape?: (event: unknown) => void;
  on_click?: (event: unknown) => void; // optional, called when the Element is clicked
  on_success?: (event: unknown) => void; // optional, called on card payment success
  on_error?: (event: unknown) => void; // optional, called on card payment error
}

interface InputPaymentElementCardSnake extends InputPaymentElementBaseSnake {
  options?: any; // https://stripe.com/docs/js/elements_object/create_element?type=card
  separate_elements?: boolean;
  card_number?: {
    elementId?: string; // default: #card-element
    options?: object;
  };
  card_expiry?: {
    elementId?: string; // default: #cardExpiry-element
  };
  card_cvc?: {
    elementId?: string; // default: #cardCvc-element
  };
}

interface InputPaymentElementIdealSnake extends InputPaymentElementBaseSnake {
  options?: {
    style?: any;
  };
}

interface InputPaymentElementPaypalSnake extends InputPaymentElementBaseSnake {
  style?: any; // https://developer.paypal.com/docs/checkout/integration-features/customize-button/
}

interface InputPaymentElementAppleSnake extends InputPaymentElementBaseSnake {
  style?: any;
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

interface InputPaymentElementGoogleSnake extends InputPaymentElementBaseSnake {
  locale?: string;
  style?: any;
  require?: {
    email?: boolean;
    shipping?: boolean;
    phone?: boolean;
  };
  classes?: {
    base?: string;
  };
}

interface InputPaymentRedirectSnake {
  on_success?: (event: unknown) => void; // optional, called on card payment success
  on_error?: (event: unknown) => void; // optional, called on card payment error
}
