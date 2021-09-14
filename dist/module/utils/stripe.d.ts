import { Cart, BillingData, CardElement, Stripe } from './types';
declare function createPaymentMethod(stripe: Stripe, cardElement: CardElement, cart: Cart): Promise<{
    error: any;
    token?: undefined;
    last4?: undefined;
    exp_month?: undefined;
    exp_year?: undefined;
    brand?: undefined;
    address_check?: undefined;
    cvc_check?: undefined;
    zip_check?: undefined;
} | {
    token: any;
    last4: any;
    exp_month: any;
    exp_year: any;
    brand: any;
    address_check: any;
    cvc_check: any;
    zip_check: any;
    error?: undefined;
}>;
declare function createIDealPaymentMethod(stripe: Stripe, element: {}, billing?: BillingData): Promise<any>;
declare function createKlarnaSource(stripe: Stripe, cart: Cart): Promise<any>;
declare function createBancontactSource(stripe: Stripe, cart: Cart): Promise<any>;
declare function stripeAmountByCurrency(currency: string, amount: number): number;
export { createPaymentMethod, createIDealPaymentMethod, createKlarnaSource, createBancontactSource, stripeAmountByCurrency, };
