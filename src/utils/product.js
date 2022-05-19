const get = require('lodash/get');

function isTrialItem(item) {
  return get(item, 'purchase_option.type') === 'trial';
}

module.exports = {
  isTrialItem,
};
