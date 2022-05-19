const sumBy = require('lodash/sumBy');
const { isTrialItem } = require('./product');

function getItemPriceTotal(item) {
  return (item.price_total || 0) + (item.tax_total || 0) - (item.discount_total || 0);
}

function getItemsPriceTotal(items = []) {
  return sumBy(items, getItemPriceTotal) || 0;
}

function getTrialItemsPriceTotal(items = []) {
  return sumBy(items, (item) => (isTrialItem(item) ? getItemPriceTotal(item) : 0));
}

function getTrialAuthAmount(items = []) {
  return sumBy(items, (item) =>
    isTrialItem(item) ? item.purchase_option.authorization_amount : 0,
  );
}

module.exports = {
  getItemPriceTotal,
  getItemsPriceTotal,
  getTrialItemsPriceTotal,
  getTrialAuthAmount,
};
