var dotenv = require('dotenv');

dotenv.config({ silent: true });

var raw = {
  STORE_ID: process.env.STORE_ID,
  PUBLIC_KEY: process.env.PUBLIC_KEY,
  STORE_URL: process.env.STORE_URL,
  VAULT_URL: process.env.VAULT_URL,
  EMAIL: process.env.EMAIL,
  PASSWORD: process.env.PASSWORD,
};

module.exports = {
  raw,
  stringified: Object.keys(raw).reduce((env, key) => {
    env[`process.env.${key}`] = JSON.stringify(raw[key]);
    return env;
  }, {}),
};
