/** @typedef {import('./payment').default} Payment */
/** @typedef {import('../../types').Cart} Cart */
/** @typedef {import('../../types').Address} Address */

/**
 * @this {Payment}
 * @param {ApplePaySession} session
 * @param {ApplePayJS.ApplePayShippingContactSelectedEvent} event
 * @returns {void}
 */
export async function onShippingContactSelected(session, event) {
  const cart = await this.updateCart({
    shipping: convertToSwellAddress(event.shippingContact),
  });

  if (cart.errors) {
    return session.completeShippingContactSelection({
      errors: createError('unknown', getErrorMessage(cart.errors)),
    });
  }

  if (!cart.shipment_rating?.services?.length) {
    return session.completeShippingContactSelection({
      errors: createError(
        'addressUnserviceable',
        'Shipping is not available for the provided address.',
      ),
    });
  }

  session.completeShippingContactSelection({
    newShippingMethods: getShippingMethods(cart),
  });
}

/**
 * @this {Payment}
 * @param {ApplePaySession} session
 * @param {ApplePayJS.ApplePayShippingMethodSelectedEvent} event
 * @returns {void}
 */
export async function onShippingMethodSelected(session, event) {
  const cart = await this.updateCart({
    shipping: {
      service: event.shippingMethod.identifier,
    },
  });

  if (cart.errors) {
    return session.completeShippingMethodSelection({
      errors: createError('unknown', getErrorMessage(cart.errors)),
    });
  }

  return session.completeShippingMethodSelection({
    newTotal: getTotal(cart),
    newLineItems: getLineItems(cart),
  });
}

/**
 * @this {Payment}
 * @param {ApplePaySession} session
 * @param {ApplePayJS.ApplePayCouponCodeChangedEvent} event
 * @returns {void}
 */
export async function onCouponCodeChanged(session, event) {
  const cart = await this.updateCart({
    coupon_code: event.couponCode || null,
  });

  if (cart.errors) {
    return session.completeCouponCodeChange({
      errors: createError('couponCodeInvalid', getErrorMessage(cart.errors)),
    });
  }

  return session.completeCouponCodeChange({
    newTotal: getTotal(cart),
    newLineItems: getLineItems(cart),
  });
}

/**
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayLineItem}
 */
export function getTotal(cart) {
  const {
    settings: { name },
    capture_total,
  } = cart;

  return {
    label: name,
    type: 'pending',
    amount: String(capture_total),
  };
}

/**
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayLineItem[]}
 */
export function getLineItems(cart) {
  const { sub_total, shipment_price, discount_total, tax_total } = cart;

  /** @type {ApplePayJS.ApplePayLineItem[]} */
  const lineItems = [{ label: 'Subtotal', amount: String(sub_total) }];

  if (shipment_price) {
    lineItems.push({ label: 'Shipping', amount: String(shipment_price) });
  }

  if (discount_total) {
    lineItems.push({ label: 'Discount', amount: String(-discount_total) });
  }

  if (tax_total) {
    lineItems.push({ label: 'Taxes', amount: String(tax_total) });
  }

  return lineItems;
}

/**
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayShippingMethod[]}
 */
export function getShippingMethods(cart) {
  const { shipment_delivery, shipment_rating } = cart;

  if (!shipment_delivery) {
    return undefined;
  }

  if (!shipment_rating?.services?.length) {
    return undefined;
  }

  return shipment_rating.services.map((service) => ({
    label: service.name,
    detail: service.description,
    amount: service.price,
    identifier: service.id,
  }));
}

/**
 * @param {ApplePayJS.ApplePayPaymentContact} [address]
 * @returns {Address}
 */
export function convertToSwellAddress(address = {}) {
  return {
    first_name: address.givenName,
    last_name: address.familyName,
    address1: address.addressLines?.[0],
    address2: address.addressLines?.[1],
    city: address.locality,
    state: address.administrativeArea,
    zip: address.postalCode,
    country: address.countryCode,
    phone: address.phoneNumber,
  };
}

/**
 * @param {object} errors
 * @returns {string}
 */
export function getErrorMessage(errors) {
  const param = Object.keys(errors)[0];
  return errors[param].message || 'Unknown error';
}

/**
 * @param {ApplePayJS.ApplePayErrorCode} code
 * @param {string} message
 * @param {ApplePayJS.ApplePayErrorContactField} contactField
 * @returns {ApplePayJS.ApplePayError[]}
 */
export function createError(code, message, contactField) {
  return [{ code, contactField, message }];
}
