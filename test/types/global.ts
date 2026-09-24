// Browser global: a script (no imports or exports) sees `swell` through
// `export as namespace`, including its types.
swell.init('store', 'pk_test');

const client: swell.SwellClient = swell.create('store', 'pk_test');
const product: swell.Product | null = null;
const price: string = client.currency.format(10);
