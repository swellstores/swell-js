import { PaymentSnake } from './snake';
import { PaymentCamel } from './camel';

interface InputPayment {
  onSuccess?: (data?: object) => void; // optional, called on payment success
  onError?: (error?: Error) => void; // optional, called on payment error
}

interface InputPaymentElement extends InputPayment {
  elementId?: string;
}

interface InputPaymentStripeElement extends InputPaymentElement {
  options?: object;
  onChange?: (event: unknown) => void; // optional, called when the Element value changes
  onReady?: (event: unknown) => void; // optional, called when the Element is fully rendered
  onFocus?: (event: unknown) => void; // optional, called when the Element gains focus
  onBlur?: (event: unknown) => void; // optional, called when the Element loses focus
  onEscape?: (event: unknown) => void; // optional, called when the escape key is pressed within an Element
  onClick?: (event: unknown) => void; // optional, called when the Element is clicked
}

export interface InputPaymentElementCard extends InputPaymentStripeElement {
  config?: object;
  seperateElements?: boolean;
  cardNumber?: InputPaymentStripeElement;
  cardExpiry?: InputPaymentStripeElement;
  cardCvc?: InputPaymentStripeElement;
}

export interface InputPaymentElementIdeal extends InputPaymentStripeElement {}

export interface InputPaymentElementPaypal extends InputPaymentElement {
  style?: {
    layout?: string;
    color?: string;
    shape?: string;
    label?: string;
    tagline?: boolean;
  };
}

export interface InputPaymentElementGoogle extends InputPaymentElement {
  locale?: string;
  style?: {
    color?: string;
    type?: string;
    sizeMode?: string;
  };
  require?: {
    name?: boolean;
    email?: boolean;
    shipping?: boolean;
    phone?: boolean;
  };
  classes?: {
    base?: string;
  };
}

export interface InputPaymentElementApple extends InputPaymentElement {
  locale?: string;
  style?: {
    type?: string;
    theme?: string;
    sizeMode?: string;
  };
  require?: {
    name?: boolean;
    email?: boolean;
    shipping?: boolean;
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

export interface InputPaymentRedirect extends InputPayment {}

export interface Payment extends PaymentSnake, PaymentCamel {}
