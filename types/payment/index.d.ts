import { PaymentSnake } from './snake';
import { PaymentCamel } from './camel';

export interface InputPaymentElementCard {
  elementId?: string; // default: #card-element
  options?: object;
  onChange?: void; // optional, called when the Element value changes
  onReady?: void; // optional, called when the Element is fully rendered
  onFocus?: void; // optional, called when the Element gains focus
  onBlur?: void; // optional, called when the Element loses focus
  onEscape?: void;
  onClick?: void; // optional, called when the Element is clicked
  onSuccess?: void; // optional, called on card payment success
  onError?: void; // optional, called on card payment error
}

export interface InputPaymentElementIdeal {
  elementId: string; // default: #idealBank-element
  options: {
    style: {
      base: {
        fontWeight: 500;
        fontSize: '16px';
      };
    };
  };
}
export interface InputPaymentElementPaypal {
  elementId: string;
  style: {
    layout?: string;
    color?: string;
    shape?: string;
    label?: string;
    tagline?: boolean;
  };
  onSuccess?: void;
  onError?: void;
}

export interface InputPaymentRedirect {
  onError?: void;
  onSuccess?: void;
}

export interface Payment extends PaymentSnake, PaymentCamel {}
