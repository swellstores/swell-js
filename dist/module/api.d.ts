import 'isomorphic-fetch';
interface Options {
    key: string;
    store: string;
    url: string;
    vaultUrl: string;
    timeout: number;
    useCamelCase: boolean;
    previewContent: boolean;
    session: object;
    locale: string;
    currency: string;
    api: object;
    base?: string;
    fullUrl?: string;
}
declare const api: {
    options: Options;
    request: typeof request;
    init(store: string, key: string, opt: Options & {
        timeout: string | number;
    }): void;
    auth(...args: any[]): any;
    get(url: any, query: any): Promise<any>;
    put(url: any, data: any): Promise<any>;
    post(url: any, data: any): Promise<any>;
    delete(url: any, data: any): Promise<any>;
    cache: any;
    card: any;
    cart: any;
    account: any;
    products: any;
    categories: any;
    attributes: any;
    subscriptions: any;
    content: any;
    settings: any;
    payment: any;
    locale: any;
    currency: any;
};
declare function request(method: string, url: string, id?: string, data?: string, opt?: object): Promise<any>;
declare global {
    interface Window {
        swell: any;
    }
}
export default api;
