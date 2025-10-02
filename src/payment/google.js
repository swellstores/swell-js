/** @typedef {import('./payment').default} Payment */
/** @typedef {import('../../types').Cart} Cart */
/** @typedef {import('../../types').Address} Address */
/** @typedef {import('../../types').Discount} Discount */

/**
 * @this {Payment}
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
 * Handles Google Pay payment data changes including shipping address updates,
 * shipping option selections, and coupon applications.
 * @this {Payment}
 * @param {google.payments.api.IntermediatePaymentData} intermediatePaymentData - The payment data from Google Pay
 * @returns {Promise<google.payments.api.PaymentDataRequestUpdate>} Updated payment data request
 */
export async function onPaymentDataChanged(intermediatePaymentData) {
  try {
    switch (intermediatePaymentData.callbackTrigger) {
      case 'INITIALIZE':
      case 'SHIPPING_ADDRESS': {
        if (!intermediatePaymentData.shippingAddress) {
          break;
        }

        // Update cart with new shipping address and force tax recalculation
        let cart = await this.updateCart({
          shipping: convertToSwellAddress(
            intermediatePaymentData.shippingAddress,
          ),
        });

        // Check if shipping is available for this address
        if (!cart.shipment_rating?.services?.length) {
          const message =
            cart.shipment_rating?.errors?.find(Boolean)?.message ??
            'Shipping is not available for the provided address.';

          return createError(
            intermediatePaymentData.callbackTrigger,
            'SHIPPING_ADDRESS_UNSERVICEABLE',
            message,
          );
        }

        // Auto-apply shipping if only one service is available
        if (cart.shipment_rating.services.length === 1) {
          const [singleService] = cart.shipment_rating.services;

          cart = await this.updateCart({
            shipping: { service: singleService.id },
          });
        }

        return {
          newShippingOptionParameters: getShippingOptionParameters.call(
            this,
            cart,
          ),
          newTransactionInfo: getTransactionInfo(cart),
        };
      }

      case 'SHIPPING_OPTION': {
        try {
          // Update cart with selected shipping option
          const cart = await this.updateCart({
            shipping: {
              service: intermediatePaymentData.shippingOptionData?.id || null,
            },
          });

          return { newTransactionInfo: getTransactionInfo(cart) };
        } catch (err) {
          return createError(
            intermediatePaymentData.callbackTrigger,
            'SHIPPING_OPTION_INVALID',
            err.message,
          );
        }
      }

      case 'OFFER': {
        try {
          // Handle coupon code application
          const codes = intermediatePaymentData.offerData.redemptionCodes ?? [];
          const code = codes.length > 0 ? codes[codes.length - 1] : null;

          const cart = await this.updateCart({
            coupon_code: code,
          });

          return {
            newOfferInfo: getOfferInfo(cart),
            newTransactionInfo: getTransactionInfo(cart),
          };
        } catch (err) {
          return createError(
            'OFFER',
            'OFFER_INVALID',
            `COUPON: ${err.message}`,
          );
        }
      }

      default:
        break;
    }
  } catch (err) {
    // Return structured error response as required by Google Pay API
    return createError(
      intermediatePaymentData.callbackTrigger,
      'OTHER_ERROR',
      err.message || 'An unexpected error occurred',
    );
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
 * Converts cart data to Google Pay display items for the payment sheet.
 * Only works when payment callbacks are properly configured.
 * @param {Cart} cart - The current cart data
 * @returns {google.payments.api.DisplayItem[]} Array of display items for Google Pay
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

  // Add individual line items
  if (Array.isArray(items)) {
    for (const item of items) {
      displayItems.push({
        type: 'LINE_ITEM',
        label: item.product?.name || 'Item',
        price: String(item.price_total || 0),
        status: 'FINAL',
      });
    }
  }

  // Add discount items
  if (Array.isArray(discounts)) {
    for (const item of discounts) {
      displayItems.push({
        type: 'DISCOUNT',
        label: getDiscountLabel(item, cart),
        price: String(-(item.amount || 0)),
      });
    }
  }

  // Add tax if applicable
  if (tax_total) {
    displayItems.push({
      type: 'TAX',
      label: 'Taxes',
      price: String(tax_total || 0),
    });
  }

  // Add shipping if applicable
  if (shipment_delivery) {
    displayItems.push({
      type: 'SHIPPING_OPTION',
      label: shipping?.service_name ?? 'Shipping',
      price: String(shipment_price || 0),
      status: shipping?.service ? 'FINAL' : 'PENDING',
    });
  }

  // Add subtotal
  displayItems.push({
    type: 'SUBTOTAL',
    label: 'Subtotal',
    price: String(sub_total || 0),
  });

  return displayItems;
}

/**
 * Converts cart data to Google Pay transaction information.
 * @param {Cart} cart - The current cart data
 * @returns {google.payments.api.TransactionInfo} Transaction info for Google Pay
 */
export function getTransactionInfo(cart) {
  const { settings, capture_total, currency, shipment_delivery, shipping } =
    cart;

  return {
    countryCode: settings?.country || 'US',
    currencyCode: currency || settings.currency || 'USD',
    totalPrice: String(capture_total ?? 0),
    // Set status to FINAL if shipping has been selected, otherwise ESTIMATED
    totalPriceStatus:
      !shipment_delivery || shipping?.service ? 'FINAL' : 'ESTIMATED',
    totalPriceLabel: 'Total',
    displayItems: getDisplayItems(cart),
  };
}

/**
 * Converts cart shipping data to Google Pay shipping option parameters.
 * @this {Payment}
 * @param {Cart} cart - The current cart data
 * @returns {google.payments.api.ShippingOptionParameters | undefined} Shipping options for Google Pay
 */
export function getShippingOptionParameters(cart) {
  const { shipment_delivery, shipment_rating, shipping } = cart;

  if (!shipment_delivery) {
    return undefined;
  }

  if (!shipment_rating?.services?.length) {
    // Return placeholder when no shipping services are available
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

  const shippingOptions = shipment_rating.services?.map((service) => ({
    id: service.id,
    label: `${service.price ? this.api.currency.format(service.price) : 'Free'}: ${service.name}`,
    description: service.description,
  }));

  // Google Pay requires a valid defaultSelectedOptionId to enable shipping option callbacks
  // Use the current shipping service if available, otherwise use the first available option
  return {
    defaultSelectedOptionId: shipping?.service ?? shippingOptions[0].id,
    shippingOptions,
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
