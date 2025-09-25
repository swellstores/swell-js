/** @typedef {import('./payment').default} Payment */
/** @typedef {import('../../types').Cart} Cart */
/** @typedef {import('../../types').Address} Address */
/** @typedef {import('../../types').Discount} Discount */

/**
 * @param {() => Promise<void>} submitPayment
 * @param {google.payments.api.PaymentData} paymentData
 * @returns {google.payments.api.PaymentAuthorizationResult}
 */
export async function onPaymentAuthorized(submitPayment, paymentData) {
  try {
    await submitPayment(paymentData);

    return { transactionState: 'SUCCESS' };
  } catch (err) {
    return {
      transactionState: 'ERROR',
      ...createError('PAYMENT_AUTHORIZATION', 'OTHER_ERROR', err.message),
    };
  }
}

/**
 * @this {Payment}
 * @param {google.payments.api.IntermediatePaymentData} intermediatePaymentData
 * @returns {Promise<google.payments.api.PaymentDataRequestUpdate>}
 */
export async function onPaymentDataChanged(intermediatePaymentData) {
  switch (intermediatePaymentData.callbackTrigger) {
    case 'INITIALIZE':
    case 'SHIPPING_ADDRESS': {
      if (!intermediatePaymentData.shippingAddress) {
        break;
      }

      const cart = await this.updateCart({
        shipping: convertToSwellAddress(
          intermediatePaymentData.shippingAddress,
        ),
      });

      if (cart.errors) {
        return createError(
          intermediatePaymentData.callbackTrigger,
          'OTHER_ERROR',
          getErrorMessage(cart.errors),
        );
      }

      if (cart.shipment_rating?.services?.length <= 0) {
        return createError(
          intermediatePaymentData.callbackTrigger,
          'SHIPPING_ADDRESS_UNSERVICEABLE',
          'Shipping is not available for the provided address.',
        );
      }

      return {
        newShippingOptionParameters: getShippingOptionParameters.call(
          this,
          cart,
        ),
      };
    }

    case 'SHIPPING_OPTION': {
      const cart = await this.updateCart({
        shipping: {
          service: intermediatePaymentData.shippingOptionData?.id || null,
        },
      });

      if (cart.errors) {
        return createError(
          intermediatePaymentData.callbackTrigger,
          'SHIPPING_OPTION_INVALID',
          getErrorMessage(cart.errors),
        );
      }

      return { newTransactionInfo: getTransactionInfo(cart) };
    }

    case 'OFFER': {
      const codes = intermediatePaymentData.offerData.redemptionCodes ?? [];
      const code = codes.length > 0 ? codes[codes.length - 1] : null;

      const cart = await this.updateCart({
        coupon_code: code,
      });

      if (cart.errors) {
        const message = getErrorMessage(cart.errors);
        return createError('OFFER', 'OFFER_INVALID', `COUPON: ${message}`);
      }

      return {
        newOfferInfo: getOfferInfo(cart),
        newTransactionInfo: getTransactionInfo(cart),
      };
    }

    default:
      break;
  }

  return {};
}

/**
 * @param {Discount} discount
 * @param {Cart} cart
 */
export function getDiscountLabel(discount, cart) {
  switch (discount.type) {
    case 'coupon': {
      const { coupon } = cart;

      if (coupon?.name) {
        return coupon.name;
      }

      break;
    }

    case 'promo': {
      const { promotions } = cart;

      if (Array.isArray(promotions?.results)) {
        const promo = promotions.results.find(
          (promo) => promo.id === discount.source_id,
        );

        if (promo?.name) {
          return promo?.name;
        }
      }

      break;
    }

    default:
      break;
  }

  return discount.id;
}

/**
 * __Important!__ This only works if the `onPaymentAuthorized` and `onPaymentDataChanged` callbacks are set.
 * Also require `totalPriceLabel` property in `TransactionInfo`.
 *
 * @param {Cart} cart
 * @returns {google.payments.api.DisplayItem[]}
 */
export function getDisplayItems(cart) {
  const {
    shipment_delivery,
    shipment_price,
    shipping,
    sub_total,
    tax_total,
    discounts,
    items,
  } = cart;

  /** @type {google.payments.api.DisplayItem[]} */
  const displayItems = [];

  if (Array.isArray(items)) {
    for (const item of items) {
      displayItems.push({
        type: 'LINE_ITEM',
        label: item.product?.name,
        price: String(item.price_total),
        status: 'FINAL',
      });
    }
  }

  if (Array.isArray(discounts)) {
    for (const item of discounts) {
      displayItems.push({
        type: 'DISCOUNT',
        label: getDiscountLabel(item, cart),
        price: String(-item.amount),
      });
    }
  }

  if (tax_total) {
    displayItems.push({
      type: 'TAX',
      label: 'Taxes',
      price: String(tax_total),
    });
  }

  if (shipment_delivery) {
    displayItems.push({
      type: 'SHIPPING_OPTION',
      label: shipping?.service_name ?? 'Shipping',
      price: String(shipment_price),
      status: shipping?.service ? 'FINAL' : 'PENDING',
    });
  }

  displayItems.push({
    type: 'SUBTOTAL',
    label: 'Subtotal',
    price: String(sub_total),
  });

  return displayItems;
}

/**
 * @param {Cart} cart
 * @returns {google.payments.api.TransactionInfo}
 */
export function getTransactionInfo(cart) {
  const {
    settings: { country },
    capture_total,
    currency,
  } = cart;

  return {
    countryCode: country,
    currencyCode: currency,
    totalPrice: String(capture_total),
    totalPriceStatus: 'ESTIMATED',
    totalPriceLabel: 'Total',
    displayItems: getDisplayItems(cart),
  };
}

/**
 * @this {Payment}
 * @param {Cart} cart
 * @returns {google.payments.api.ShippingOptionParameters | undefined}
 */
export function getShippingOptionParameters(cart) {
  const { shipment_delivery, shipment_rating, shipping } = cart;

  if (!shipment_delivery) {
    return undefined;
  }

  if (!shipment_rating) {
    return {
      defaultSelectedOptionId: 'unknown',
      shippingOptions: [
        {
          id: 'unknown',
          label: 'Standard Shipping',
          description: 'Please fill in the shipping address.',
        },
      ],
    };
  }

  return {
    defaultSelectedOptionId: shipping?.service,
    shippingOptions: shipment_rating.services?.map((service) => ({
      id: service.id,
      label: `${service.price ? this.api.currency.format(service.price) : 'Free'}: ${service.name}`,
      description: service.description,
    })),
  };
}

/**
 * @param {Cart} cart
 * @returns {google.payments.api.OfferInfo | undefined}
 */
export function getOfferInfo(cart) {
  if (!cart.coupon_code) {
    return undefined;
  }

  return {
    offers: [
      {
        redemptionCode: cart.coupon_code,
        description: cart.coupon?.description || '',
      },
    ],
  };
}

/**
 * @param {google.payments.api.Address} address
 * @returns {Address}
 */
export function convertToSwellAddress(address) {
  return {
    name: address.name,
    address1: address.address1,
    address2: address.address2,
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
function getErrorMessage(errors) {
  const param = Object.keys(errors)[0];
  return errors[param].message || 'Unknown error';
}

/**
 * @param {google.payments.api.CallbackIntent} intent
 * @param {google.payments.api.ErrorReason} reason
 * @param {string} message
 * @returns {google.payments.api.PaymentDataRequestUpdate}
 */
export function createError(intent, reason, message) {
  return {
    error: {
      intent,
      reason,
      message,
    },
  };
}
