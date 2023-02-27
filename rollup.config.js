import replacePlugin from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';
import filesize from 'rollup-plugin-filesize';
import pkg from './package.json';

const deps = Object.keys(pkg.dependencies);
const external = (id) => deps.filter((dep) => id.startsWith(dep)).length;
const replace = replacePlugin({
  preventAssignment: true,
  __VERSION__: pkg.version,
});

export default [
  {
    input: {
      'utils/index': './src/utils/index.js',
      account: './src/account.js',
      api: './src/api.js',
      attributes: './src/attributes.js',
      cache: './src/cache.js',
      card: './src/card.js',
      cart: './src/cart.js',
      categories: './src/categories.js',
      content: './src/content.js',
      cookie: './src/cookie.js',
      currency: './src/currency.js',
      locale: './src/locale.js',
      payment: './src/payment/index.js',
      products: './src/products.js',
      settings: './src/settings.js',
      subscriptions: './src/subscriptions.js',
      index: './src/index.js',
    },
    external,
    output: { dir: './dist', entryFileNames: '[name].js' },
    plugins: [
      replace,
      nodePolyfills(),
      resolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs({ include: 'node_modules/**' }),
      filesize(),
    ],
  },
  {
    input: './src/index.js',
    output: {
      name: 'swell',
      sourcemap: true,
      exports: 'default',
      file: pkg.main,
      format: 'cjs',
    },
    external,
    plugins: [
      replace,
      nodePolyfills(),
      resolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      filesize(),
    ],
  },
  {
    input: './src/index.js',
    output: {
      name: 'swell',
      sourcemap: true,
      exports: 'default',
      file: pkg.browser,
      format: 'umd',
    },
    plugins: [
      replace,
      nodePolyfills(),
      resolve({
        moduleDirectories: ['node_modules'],
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      esbuild(),
      filesize(),
    ],
  },
];
