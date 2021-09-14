import { reduce, isEmpty, get, toLower, map, toNumber } from 'lodash';
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
    return reduce(fieldsMap, (acc, srcKey, destKey) => {
        const value = data[srcKey];
        if (value) {
            acc[destKey] = value;
        }
        return acc;
    }, {});
}
function getBillingDetails(data) {
    const { account = {}, billing = {}, shipping = {} } = data;
    const accountShipping = get(account, 'shipping', {});
    const accountBilling = get(account, 'billing', {});
    const billingData = {
        ...accountShipping,
        ...accountBilling,
        ...shipping,
        ...billing,
    };
    const billingDetails = fillValues(billingFieldsMap);
    if (!isEmpty(billingDetails)) {
        const address = fillValues(addressFieldsMap);
        return {
            ...billingDetails,
            ...(!isEmpty(address) ? { address } : {}),
        };
    }
}
function getKlarnaItems(cart) {
    const currency = toLower(get(cart, 'currency', 'eur'));
    const items = map(cart.items, (item) => ({
        type: 'sku',
        description: item.product.name,
        quantity: item.quantity,
        currency,
        amount: Math.round(toNumber(item.price_total - item.discount_total) * 100),
    }));
    const tax = get(cart, 'tax_included_total');
    if (tax) {
        items.push({
            type: 'tax',
            description: 'Taxes',
            currency,
            amount: Math.round(toNumber(tax) * 100),
        });
    }
    const shipping = get(cart, 'shipping');
    const shippingTotal = get(cart, 'shipment_total');
    if (shipping.price) {
        items.push({
            type: 'shipping',
            description: shipping.service_name,
            currency,
            amount: Math.round(toNumber(shippingTotal) * 100),
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
    source.klarna = { ...source.klarna, ...fillValues(shippingNameFieldsMap, data.shipping) };
    const shipping = fillValues(shippingFieldsMap, data.shipping);
    const shippingAddress = fillValues(addressFieldsMap, data.shipping);
    if (shipping || shippingAddress) {
        source.source_order.shipping = {
            ...(shipping ? shipping : {}),
            ...(shippingAddress ? { address: shippingAddress } : {}),
        };
    }
    source.klarna = {
        ...source.klarna,
        ...fillValues(billingNameFieldsMap, data.billing || get(data, 'account.billing') || data.shipping),
    };
    const billing = fillValues(billingFieldsMap, data.account);
    const billingAddress = fillValues(addressFieldsMap, data.billing || get(data, 'account.billing') || data.shipping);
    if (billing || billingAddress) {
        source.owner = {
            ...(billing ? billing : {}),
            ...(billingAddress ? { address: billingAddress } : {}),
        };
    }
}
function setBancontactOwner(source, data) {
    const { account = {}, billing, shipping } = data;
    const billingData = {
        ...account.shipping,
        ...account.billing,
        ...shipping,
        ...billing,
    };
    const billingAddress = fillValues(addressFieldsMap, billingData);
    source.owner = {
        email: account.email,
        name: billingData.name || account.name,
        ...(billingData.phone
            ? { phone: billingData.phone }
            : account.phone
                ? { phone: account.phone }
                : {}),
        ...(!isEmpty(billingAddress) ? { address: billingAddress } : {}),
    };
}
async function createPaymentMethod(stripe, cardElement, cart) {
    const billingDetails = getBillingDetails(cart);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        ...(billingDetails ? { billing_details: billingDetails } : {}),
    });
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
async function createIDealPaymentMethod(stripe, element, billing = { account: {}, billing: {}, shipping: {} }) {
    const billingDetails = getBillingDetails(billing);
    return await stripe.createPaymentMethod({
        type: 'ideal',
        ideal: element,
        ...(billingDetails ? { billing_details: billingDetails } : {}),
    });
}
async function createKlarnaSource(stripe, cart) {
    const sourceObject = {
        type: 'klarna',
        flow: 'redirect',
        amount: Math.round(get(cart, 'grand_total', 0) * 100),
        currency: toLower(get(cart, 'currency', 'eur')),
        klarna: {
            product: 'payment',
            purchase_country: get(cart, 'settings.country', 'DE'),
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
async function createBancontactSource(stripe, cart) {
    const sourceObject = {
        type: 'bancontact',
        amount: Math.round(get(cart, 'grand_total', 0) * 100),
        currency: toLower(get(cart, 'currency', 'eur')),
        redirect: {
            return_url: window.location.href,
        },
    };
    setBancontactOwner(sourceObject, cart);
    return await stripe.createSource(sourceObject);
}
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
export { createPaymentMethod, createIDealPaymentMethod, createKlarnaSource, createBancontactSource, stripeAmountByCurrency, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3N0cmlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFZdEUsTUFBTSxnQkFBZ0IsR0FBRztJQUN2QixJQUFJLEVBQUUsTUFBTTtJQUNaLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEtBQUssRUFBRSxVQUFVO0lBQ2pCLEtBQUssRUFBRSxVQUFVO0lBQ2pCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLEtBQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsSUFBSSxFQUFFLE1BQU07SUFDWixLQUFLLEVBQUUsT0FBTztDQUNmLENBQUM7QUFJRixTQUFTLFVBQVUsQ0FBQyxTQUFpQixFQUFFLElBQWE7SUFDbEQsT0FBTyxNQUFNLENBQ1gsU0FBUyxFQUNULENBQUMsR0FBUSxFQUFFLE1BQVcsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUNqQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxLQUFLLEVBQUU7WUFDVCxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ3RCO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLEVBQ0QsRUFBRSxDQUNILENBQUE7QUFDSCxDQUFDO0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxJQUFpQjtJQUMxQyxNQUFNLEVBQUUsT0FBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFLFFBQVEsR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDM0QsTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7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