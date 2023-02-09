import { PaymentSnake } from './snake';
import { PaymentCamel } from './camel';

export interface InputPaymentElementCard {
  seperateElements?: boolean;
  cardNumber?: {
    elementId?: string; // default: #card-element
    options?: object;
  };
  cardExpiry?: {
    elementId?: string; // default: #cardExpiry-element
  };
  cardCvc?: {
    elementId?: string; // default: #cardCvc-element
  };
  onChange?: (event: unknown) => void; // optional, called when the Element value changes
  onReady?: (event: unknown) => void; // optional, called when the Element is fully rendered
  onFocus?: (event: unknown) => void; // optional, called when the Element gains focus
  onBlur?: (event: unknown) => void; // optional, called when the Element loses focus
  onEscape?: (event: unknown) => void;
  onClick?: (event: unknown) => void; // optional, called when the Element is clicked
  onSuccess?: (event: unknown) => void; // optional, called on card payment success
  onError?: (event: unknown) => void; // optional, called on card payment error
}

export interface InputPaymentElementIdeal {
  elementId?: string; // default: #idealBank-element
  options?: {
    style: {
      base: {
        fontWeight: 500;
        fontSize: '16px';
      };
    };
  };
  onChange?: (event: unknown) => void; // optional, called when the Element value changes
  onReady?: (event: unknown) => void; // optional, called when the Element is fully rendered
  onFocus?: (event: unknown) => void; // optional, called when the Element gains focus
  onBlur?: (event: unknown) => void; // optional, called when the Element loses focus
  onEscape?: (event: unknown) => void;
  onClick?: (event: unknown) => void; // optional, called when the Element is clicked
  onSuccess?: (event: unknown) => void; // optional, called on card payment success
  onError?: (event: unknown) => void; // optional, called on card payment error
}
export interface InputPaymentElementPaypal {
  elementId?: string;
  style?: {
    layout?: string;
    color?: string;
    shape?: string;
    label?: string;
    tagline?: boolean;
  };
  onSuccess?: (event: unknown) => void;
  onError?: (event: unknown) => void;
}

export interface InputPaymentRedirect {
  onError?: void;
  onSuccess?: void;
}

export interface Payment extends PaymentSnake, PaymentCamel {}
