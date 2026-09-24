import swell from 'swell-js';
import type { Cart, Product, SwellClient } from 'swell-js';

swell.init('store', 'pk_test');

export const client: SwellClient = swell.create('store', 'pk_test');
export const product: Product | null = null;
export const cart: Cart | null = null;
export const price: string = swell.currency.format(10);
export const removed: Promise<object> = client.functions.delete('app', 'fn');
