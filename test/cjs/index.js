const swell = require('swell-js');

const storeId = 'STORE_ID';
const publicKey = 'PUBLIC_KEY';

swell.init(storeId, publicKey, {
  useCamelCase: true,
});

swell.products.list().then((products) => {
  console.log(products.results);
});

console.log(swell.utils.round(10));
