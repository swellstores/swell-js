export interface CartItem {
    product: {
        name: string;
    };
    quantity: number;
    price_total: number;
    discount_total: number;
}
export interface Cart {
    items: CartItem[];
    account: {};
    billing: {};
    shipping: {
        price: number;
        service_name: string;
    };
}
export interface BillingData {
    account: {};
    billing: {};
    shipping: {};
}
export interface Stripe {
    createElements: Function;
    createPaymentMethod: Function;
    createSource: Function;
}
export interface KlarnaItem {
    type: string;
    description: string;
    currency: string;
    amount: number;
}
export interface FieldMap {
    [key: string]: string;
}
export interface KlarnaSource {
    type?: string;
    flow?: string;
    amount?: number;
    currency?: string;
    klarna: any;
    source_order: any;
    redirect?: {
        return_url: string;
    };
    owner?: any;
}
export interface KlanaFieldMap {
    shipping_first_name?: string;
    shipping_last_name?: string;
    phone?: string;
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}
export interface KlarnaData {
    [x: string]: any;
    price?: number;
    service_name?: string;
}
export interface BancontactSource {
    type?: string;
    amount?: number;
    currency?: string;
    redirect?: {
        return_url: string;
    };
    owner?: any;
}
export interface BancontactData {
    items?: CartItem[];
    account: any;
    billing: any;
    shipping: any;
}
export interface BancontactFieldsMap {
    city: string;
    country: string;
    line1: string;
    line2: string;
    postal_code: string;
    state: string;
}
export interface MergeOptions {
    cloneUnlessOtherwiseSpecified: Function;
    isMergeableObject: Function;
}
export interface Options {
    vaultUrl?: string;
    timeout?: number;
    useCamelCase?: boolean;
    key?: string;
    store?: string;
    url?: string;
    previewContent?: boolean;
    session?: string | object;
    locale?: string;
    currency?: string;
    api?: object;
}
export interface CardElement {
}
