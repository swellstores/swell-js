import cardApi from '../../card';
import { isLiveMode } from '../../utils';

import {
  getBrowserInfo,
  getBaseConvesioApiUrl,
  getConvesioErrorMessage,
} from '../convesiopay';

import Payment from '../payment';

export default class ConvesioCardPayment extends Payment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods.card);
  }

  async createElements() {}

  async tokenize() {
    const cardNumber = (
      this.params.number ||
      document.getElementById(
        this.params.cardNumber?.elementId || 'cardNumber-element',
      )?.value ||
      ''
    ).replace(/[^0-9]+/g, '');

    const cardExpiry = cardApi.expiry(
      this.params.exp ||
        document.getElementById(
          this.params.cardExpiry?.elementId || 'cardExpiry-element',
        )?.value ||
        '',
    );

    const cardCvc = (
      this.params.cvc ||
      document.getElementById(
        this.params.cardCvc?.elementId || 'cardCvc-element',
      )?.value ||
      ''
    ).trim();

    const cardHolder = (
      this.params.name ||
      document.getElementById(
        this.params.cardHolder?.elementId || 'cardHolder-element',
      )?.value ||
      ''
    ).trim();

    const cardBrand = cardApi.type(cardNumber).toLowerCase();

    const payment = await createConvesioCardPaymentToken(this.method, {
      paymentMethod: {
        type: 'scheme',
        brand: cardBrand,
        last4: cardNumber.slice(-4),
      },
      origin: window.location.origin,
      storePaymentMethod: true,
      browserInfo: getBrowserInfo(),
      shopperIp: await getShopperIp(),
      number: cardNumber,
      expiryDate: {
        expiryMonth: String(cardExpiry.month).padStart(2, '0'),
        expiryYear: String(cardExpiry.year).slice(-2),
      },
      cvc: cardCvc,
      holderName: cardHolder,
    });

    await this.updateCart({
      billing: {
        method: 'card',
        account_card_id: null,
        card: {
          gateway: 'convesiopay',
          token: payment.token || payment.paymentToken,
          last4: cardNumber.slice(-4),
          brand: cardBrand,
          exp_month: cardExpiry.month,
          exp_year: cardExpiry.year,
          test: isLiveMode(this.method.mode) ? undefined : true,
        },
        convesiopay: {
          return_url: this.params.returnUrl,
        },
      },
    });

    return this.onSuccess();
  }
}

function createConvesioCardPaymentToken(settings, data) {
  const baseUrl = getBaseConvesioApiUrl(settings.mode);

  return fetch(`${baseUrl}/v1/create-token`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'convesio-pay-dashboard',
      'X-Api-Key': settings.public_key,
    },
    body: JSON.stringify(data),
  }).then(async (res) => {
    if (!res.ok) {
      throw new Error(
        (await getConvesioErrorMessage(res)) || 'Failed to create token',
      );
    }

    return res.json();
  });
}

let cachedIp = null;

function getShopperIp() {
  // Return cached IP if available
  if (cachedIp) {
    return cachedIp;
  }

  // Fetch IP from ipify (free, no API key required)
  return fetch('https://api.ipify.org?format=json', {
    method: 'GET',
    cache: 'no-store',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch IP');
      }

      return response.json();
    })
    .then(
      (data) => {
        cachedIp = data.ip;
        return cachedIp;
      },
      (err) => {
        console.err(err);
        return null;
      },
    );
}
