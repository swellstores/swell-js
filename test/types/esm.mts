import swell from 'swell-js';
import type {
  Cart,
  Consent,
  ConsentCamel,
  Product,
  PublicConfig,
  SwellClient,
} from 'swell-js';

swell.init('store', 'pk_test');

export const client: SwellClient = swell.create('store', 'pk_test');
export const product: Product | null = null;
export const cart: Cart | null = null;
export const price: string = swell.currency.format(10);
export const removed: Promise<object> = client.functions.delete('app', 'fn');

const config: PublicConfig = {
  storeId: 'store',
  publicKey: 'pk_test',
  headers: { 'Swell-Storefront-Id': 'storefront' },
  locale: 'en-US',
};
swell.create(config.storeId, config.publicKey, {
  ...config,
  setCookie(_name, _value, options) {
    const expires: string | number | boolean | Date | undefined = options?.expires;
    void expires;
  },
});
client.setCookie('swell-session', 'value', { secure: true, 'max-age': 60, expires: new Date() });
// @ts-expect-error Public config cannot contain callbacks.
const invalidConfig: PublicConfig = { ...config, getCookie: () => undefined };
void invalidConfig;

// Consent: answers and the result follow the client's case
export const consent: Promise<Consent> = client.consent.set({
  marketing: true,
  sale_of_data: false,
});
void client.consent.set();
// @ts-expect-error A snake_case client passes sale_of_data.
void client.consent.set({ saleOfData: false });
const camelClient: SwellClient<'camel'> = swell.create('store', 'pk_test', {
  useCamelCase: true,
});
export const consentCamel: Promise<ConsentCamel> = camelClient.consent.set({
  saleOfData: false,
});
export const saleOfData: Promise<boolean> = camelClient.consent
  .set()
  .then((result) => result.effective.saleOfData && result.saleOfData !== null);
// @ts-expect-error A camelCase client gets saleOfData back.
void camelClient.consent.set().then((result) => result.sale_of_data);
