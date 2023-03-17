import { PaymentSnake } from './snake';
import { PaymentCamel } from './camel';

interface InputPayment {
  onSuccess?: (data?: object) => void; // optional, called on payment success
  onError?: (error?: Error) => void; // optional, called on payment error
}

interface InputPaymentElement extends InputPayment {
  elementId?: string;
}

interface StripeOptionsStyles {
  backgroundColor?: string;
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontSmoothing?: string;
  fontStyle?: string;
  fontVariant?: string;
  fontWeight?: string;
  iconColor?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: string;
  padding?: string;
  textDecoration?: string;
  textShadow?: string;
  textTransform?: string;
}

interface StripeOptions {
  // https://stripe.com/docs/js/elements_object/create_element?type=card
  classes?: object; // https://stripe.com/docs/js/appendix/style?type=card
  style?: {
    base?: StripeOptionsStyles;
    complete?: StripeOptionsStyles;
    empty?: StripeOptionsStyles;
    invalid?: StripeOptionsStyles;
  };
  value?: string;
  hidePostalCode?: boolean;
  iconStyle?: string;
  hideIcon?: boolean;
  disable?: boolean;
}

interface InputPaymentStripeElement extends InputPaymentElement {
  options?: StripeOptions;
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

export interface InputPaymentElementAmazon extends InputPaymentElement {
  locale?: string;
  placement?: string;
  style?: {
    color?: string;
  };
  require?: {
    shipping?: boolean;
  };
  classes?: {
    base?: string;
  };
}

export interface InputPaymentRedirect extends InputPayment {}

export interface Payment extends PaymentSnake, PaymentCamel {}
