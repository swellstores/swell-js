import swell = require('swell-js');
import type { Cart, Product, SwellClient } from 'swell-js';

swell.init('store', 'pk_test');

const client: SwellClient<'camel'> = swell.create('store', 'pk_test');
const product: Product | null = null;
const cart: Cart | null = null;
const price: string = swell.currency.format(10);

export = { client, product, cart, price };
