"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeAmountByCurrency = exports.createBancontactSource = exports.createKlarnaSource = exports.createIDealPaymentMethod = exports.createPaymentMethod = void 0;
const lodash_1 = require("lodash");
const addressFieldsMap = {
    city: 'city',
    country: 'country',
    line1: 'address1',
    line2: 'address2',
    postal_code: 'zip',
    state: 'state',
};
const billingFieldsMap = {
    name: 'name',
    phone: 'phone',
};
function fillValues(fieldsMap, data) {
    return lodash_1.reduce(fieldsMap, (acc, srcKey, destKey) => {
        const value = data[srcKey];
        if (value) {
            acc[destKey] = value;
        }
        return acc;
    }, {});
}
function getBillingDetails(data) {
    const { account = {}, billing = {}, shipping = {} } = data;
    const accountShipping = lodash_1.get(account, 'shipping', {});
    const accountBilling = lodash_1.get(account, 'billing', {});
    const billingData = Object.assign(Object.assign(Object.assign(Object.assign({}, accountShipping), accountBilling), shipping), billing);
    const billingDetails = fillValues(billingFieldsMap);
    if (!lodash_1.isEmpty(billingDetails)) {
        const address = fillValues(addressFieldsMap);
        return Object.assign(Object.assign({}, billingDetails), (!lodash_1.isEmpty(address) ? { address } : {}));
    }
}
function getKlarnaItems(cart) {
    const currency = lodash_1.toLower(lodash_1.get(cart, 'currency', 'eur'));
    const items = lodash_1.map(cart.items, (item) => ({
        type: 'sku',
        description: item.product.name,
        quantity: item.quantity,
        currency,
        amount: Math.round(lodash_1.toNumber(item.price_total - item.discount_total) * 100),
    }));
    const tax = lodash_1.get(cart, 'tax_included_total');
    if (tax) {
        items.push({
            type: 'tax',
            description: 'Taxes',
            currency,
            amount: Math.round(lodash_1.toNumber(tax) * 100),
        });
    }
    const shipping = lodash_1.get(cart, 'shipping');
    const shippingTotal = lodash_1.get(cart, 'shipment_total');
    if (shipping.price) {
        items.push({
            type: 'shipping',
            description: shipping.service_name,
            currency,
            amount: Math.round(lodash_1.toNumber(shippingTotal) * 100),
        });
    }
    return items;
}
function setKlarnaBillingShipping(source, data) {
    const shippingNameFieldsMap = {
        shipping_first_name: 'first_name',
        shipping_last_name: 'last_name',
    };
    const shippingFieldsMap = {
        phone: 'phone',
    };
    const billingNameFieldsMap = {
        first_name: 'first_name',
        last_name: 'last_name',
    };
    const billingFieldsMap = {
        email: 'email',
    };
    source.klarna = Object.assign(Object.assign({}, source.klarna), fillValues(shippingNameFieldsMap, data.shipping));
    const shipping = fillValues(shippingFieldsMap, data.shipping);
    const shippingAddress = fillValues(addressFieldsMap, data.shipping);
    if (shipping || shippingAddress) {
        source.source_order.shipping = Object.assign(Object.assign({}, (shipping ? shipping : {})), (shippingAddress ? { address: shippingAddress } : {}));
    }
    source.klarna = Object.assign(Object.assign({}, source.klarna), fillValues(billingNameFieldsMap, data.billing || lodash_1.get(data, 'account.billing') || data.shipping));
    const billing = fillValues(billingFieldsMap, data.account);
    const billingAddress = fillValues(addressFieldsMap, data.billing || lodash_1.get(data, 'account.billing') || data.shipping);
    if (billing || billingAddress) {
        source.owner = Object.assign(Object.assign({}, (billing ? billing : {})), (billingAddress ? { address: billingAddress } : {}));
    }
}
function setBancontactOwner(source, data) {
    const { account = {}, billing, shipping } = data;
    const billingData = Object.assign(Object.assign(Object.assign(Object.assign({}, account.shipping), account.billing), shipping), billing);
    const billingAddress = fillValues(addressFieldsMap, billingData);
    source.owner = Object.assign(Object.assign({ email: account.email, name: billingData.name || account.name }, (billingData.phone
        ? { phone: billingData.phone }
        : account.phone
            ? { phone: account.phone }
            : {})), (!lodash_1.isEmpty(billingAddress) ? { address: billingAddress } : {}));
}
async function createPaymentMethod(stripe, cardElement, cart) {
    const billingDetails = getBillingDetails(cart);
    const { error, paymentMethod } = await stripe.createPaymentMethod(Object.assign({ type: 'card', card: cardElement }, (billingDetails ? { billing_details: billingDetails } : {})));
    return error
        ? { error }
        : {
            token: paymentMethod.id,
            last4: paymentMethod.card.last4,
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year,
            brand: paymentMethod.card.brand,
            address_check: paymentMethod.card.checks.address_line1_check,
            cvc_check: paymentMethod.card.checks.cvc_check,
            zip_check: paymentMethod.card.checks.address_zip_check,
        };
}
exports.createPaymentMethod = createPaymentMethod;
async function createIDealPaymentMethod(stripe, element, billing = { account: {}, billing: {}, shipping: {} }) {
    const billingDetails = getBillingDetails(billing);
    return await stripe.createPaymentMethod(Object.assign({ type: 'ideal', ideal: element }, (billingDetails ? { billing_details: billingDetails } : {})));
}
exports.createIDealPaymentMethod = createIDealPaymentMethod;
async function createKlarnaSource(stripe, cart) {
    const sourceObject = {
        type: 'klarna',
        flow: 'redirect',
        amount: Math.round(lodash_1.get(cart, 'grand_total', 0) * 100),
        currency: lodash_1.toLower(lodash_1.get(cart, 'currency', 'eur')),
        klarna: {
            product: 'payment',
            purchase_country: lodash_1.get(cart, 'settings.country', 'DE'),
        },
        source_order: {
            items: getKlarnaItems(cart),
        },
        redirect: {
            return_url: window.location.href,
        },
    };
    setKlarnaBillingShipping(sourceObject, cart);
    return await stripe.createSource(sourceObject);
}
exports.createKlarnaSource = createKlarnaSource;
async function createBancontactSource(stripe, cart) {
    const sourceObject = {
        type: 'bancontact',
        amount: Math.round(lodash_1.get(cart, 'grand_total', 0) * 100),
        currency: lodash_1.toLower(lodash_1.get(cart, 'currency', 'eur')),
        redirect: {
            return_url: window.location.href,
        },
    };
    setBancontactOwner(sourceObject, cart);
    return await stripe.createSource(sourceObject);
}
exports.createBancontactSource = createBancontactSource;
function stripeAmountByCurrency(currency, amount) {
    const zeroDecimalCurrencies = [
        'BIF',
        'DJF',
        'JPY',
        'KRW',
        'PYG',
        'VND',
        'XAF',
        'XPF',
        'CLP',
        'GNF',
        'KMF',
        'MGA',
        'RWF',
        'VUV',
        'XOF' // West African Cfa Franc
    ];
    if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
        return amount;
    }
    else {
        return Math.round(amount * 100);
    }
}
exports.stripeAmountByCurrency = stripeAmountByCurrency;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3N0cmlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBc0U7QUFZdEUsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixJQUFJLEVBQUUsTUFBTTtJQUNaLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEtBQUssRUFBRSxVQUFVO0lBQ2pCLEtBQUssRUFBRSxVQUFVO0lBQ2pCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLEtBQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsT0FBTztDQUNmLENBQUM7QUFJRixTQUFTLFVBQVUsQ0FBQyxTQUFpQixFQUFFLElBQWE7SUFDbEQsT0FBTyxlQUFNLENBQ1gsU0FBUyxFQUNULENBQUMsR0FBUSxFQUFFLE1BQVcsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxLQUFLLEVBQUU7WUFDVCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLEVBQ0QsRUFBRSxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFpQjtJQUMxQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLFFBQVEsR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDM0QsTUFBTSxlQUFlLEdBQUcsWUFBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckQsTUFBTSxjQUFjLEdBQUcsWUFBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFbkQsTUFB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