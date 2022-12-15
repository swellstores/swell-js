import swell from 'swell-js';

const SWELL_STORE_ID = 'test';
const SWELL_PUBLIC_KEY = '...';

swell.init(SWELL_STORE_ID, SWELL_PUBLIC_KEY, { useCamelCase: true });

swell.products.list().then(({ results }) => console.log(results));
console.log(swell.utils.round(10, 20));
