/** @typedef {import('./payment').default} Payment */
/** @typedef {import('../../types').Cart} Cart */
/** @typedef {import('../../types').Address} Address */

/**
 * Handles Apple Pay shipping contact selection event
 *
 * IMPORTANT: This event fires automatically when the Apple Pay sheet opens
 * with the user's default address. This is expected Apple Pay behavior.
 *
 * The flow:
 * 1. Apple Pay sheet opens → This event fires with default address
 * 2. User changes address → This event fires again with new address
 * 3. Each time, we:
 *    - Send the address to Swell to calculate shipping/tax
 *    - Return updated totals and available shipping methods
 *
 * @this {Payment}
 * @param {ApplePaySession} session
 * @param {ApplePayJS.ApplePayShippingContactSelectedEvent} event
 * @returns {void}
 */
export async function onShippingContactSelected(session, event) {
  // Update cart with Apple Pay shipping address to get shipping options and tax
  // This happens immediately when the sheet opens with the default address
  const cart = await this.updateCart({
    shipping: convertToSwellAddress(event.shippingContact),
  });

  if (cart.errors) {
    const cartData = await this.getCart();

    return session.completeShippingContactSelection({
      newTotal: getTotal(cartData),
      newLineItems: getLineItems(cartData),
      newShippingMethods: [], // REQUIRED: Must always provide this, even as empty array
      errors: createError('unknown', getErrorMessage(cart.errors)),
    });
  }

  if (!cart.shipment_rating?.services?.length) {
    const message =
      cart.shipment_rating?.errors?.find(Boolean)?.message ??
      'Shipping is not available for the provided address.';

    return session.completeShippingContactSelection({
      newTotal: getTotal(cart),
      newLineItems: getLineItems(cart),
      newShippingMethods: [], // REQUIRED: Must always provide this, even as empty array
      errors: createError('addressUnserviceable', message, 'postalAddress'),
    });
  }

  // Success: Return updated totals and shipping methods
  session.completeShippingContactSelection({
    newTotal: getTotal(cart),
    newLineItems: getLineItems(cart),
    newShippingMethods: getShippingMethods(cart),
  });
}

/**
 * Handles Apple Pay shipping method selection
 *
 * Triggered when the user selects a shipping method from the available options.
 * We update the cart with the selected shipping service and return the updated
 * total and line items (which now include the shipping cost).
 *
 * After this event, the total changes from type 'pending' to 'final' and shows
 * the actual final amount to the user.
 *
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
      newTotal: getTotal(await this.getCart()),
      errors: createError('unknown', getErrorMessage(cart.errors)),
    });
  }

  return session.completeShippingMethodSelection({
    newTotal: getTotal(cart),
    newLineItems: getLineItems(cart),
  });
}

/**
 * Handles Apple Pay coupon code changes
 *
 * Triggered when the user enters or removes a coupon code in the Apple Pay sheet.
 * We apply the coupon to the cart and return updated totals reflecting the discount.
 *
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
      newTotal: getTotal(await this.getCart()),
      errors: createError('couponCodeInvalid', getErrorMessage(cart.errors)),
    });
  }

  return session.completeCouponCodeChange({
    newTotal: getTotal(cart),
    newLineItems: getLineItems(cart),
  });
}

/**
 * Generates the total line item for Apple Pay
 *
 * IMPORTANT: The 'type' field controls what Apple Pay displays:
 * - 'pending': Shows "Amount Pending" (used before shipping is selected)
 * - 'final': Shows actual amount like "US$49.70" (used after shipping selected)
 *
 * This ensures the user sees "pending" until they've selected shipping,
 * then sees the final amount once everything is calculated.
 *
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayLineItem}
 */
export function getTotal(cart) {
  const {
    settings: { name },
    capture_total,
    shipment_delivery,
    shipping,
  } = cart;

  // Use 'final' only after shipping method is selected or not needed, otherwise 'pending'
  const isFinalPrice = !shipment_delivery || shipping?.service;
  const type = isFinalPrice ? 'final' : 'pending';

  return {
    // Here the label should contain the company name
    label: name || 'Company name',
    type,
    amount: Number(capture_total || 0).toFixed(2),
  };
}

/**
 * Generates line items breakdown for Apple Pay sheet
 *
 * IMPORTANT: All amounts MUST be formatted as strings with exactly 2 decimal places.
 * Apple Pay is very strict about this format and will throw TypeError if invalid.
 *
 * Line items shown:
 * - Subtotal (always shown)
 * - Shipping (shown after shipping method selected)
 * - Taxes (shown after Swell calculates tax based on address)
 * - Discount (shown if coupon applied)
 *
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayLineItem[]}
 */
export function getLineItems(cart) {
  const { sub_total, shipment_price, discount_total, tax_total } = cart;

  /** @type {ApplePayJS.ApplePayLineItem[]} */
  const lineItems = [
    {
      label: 'Subtotal',
      amount: Number(sub_total || 0).toFixed(2),
    },
  ];

  if (shipment_price) {
    lineItems.push({
      label: 'Shipping',
      amount: Number(shipment_price).toFixed(2),
    });
  }

  if (discount_total) {
    lineItems.push({
      label: 'Discount',
      amount: Number(-discount_total).toFixed(2),
    });
  }

  if (tax_total) {
    lineItems.push({
      label: 'Taxes',
      amount: Number(tax_total).toFixed(2),
    });
  }

  return lineItems;
}

/**
 * Generates shipping methods from Swell shipment rating
 *
 * Returns undefined if no shipping is configured or no methods available.
 * This tells Apple Pay that shipping options will be provided later.
 *
 * IMPORTANT: Amounts must be formatted as strings with 2 decimals.
 *
 * @param {Cart} cart
 * @returns {ApplePayJS.ApplePayShippingMethod[] | undefined}
 */
export function getShippingMethods(cart) {
  const { shipment_delivery, shipment_rating } = cart;

  if (!shipment_delivery) {
    return undefined;
  }

  if (!shipment_rating?.services?.length) {
    return undefined;
  }

  return shipment_rating.services.map((service, index) => ({
    label: service.name || `Shipping ${index + 1}`,
    detail: service.description || '',
    amount: Number(service.price || 0).toFixed(2),
    identifier: service.id,
  }));
}

/**
 * Converts Apple Pay address format to Swell address format
 *
 * IMPORTANT FIXES:
 * 1. addressLines uses optional chaining (?.[0]) because it may be undefined
 *    when Apple Pay initially loads (privacy protection)
 * 2. countryCode is converted to UPPERCASE because:
 *    - Apple Pay sends lowercase (e.g., "gb", "us")
 *    - Swell requires uppercase (e.g., "GB", "US")
 *
 * Apple Pay Field Mappings:
 * - givenName → first_name
 * - familyName → last_name
 * - addressLines[0] → address1 (street address line 1)
 * - addressLines[1] → address2 (street address line 2)
 * - locality → city
 * - administrativeArea → state (or county/province)
 * - postalCode → zip
 * - countryCode → country (ISO 3166-1 alpha-2 code)
 * - phoneNumber → phone
 *
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
    country: address.countryCode?.toUpperCase(),
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
