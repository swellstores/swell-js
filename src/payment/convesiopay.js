import { isLiveMode } from '../utils';

let convesioSettings = null;

export function getBaseConvesioApiUrl(mode) {
  return isLiveMode(mode)
    ? 'https://api.convesiopay.com'
    : 'https://api-qa.convesiopay.com';
}

export async function getConvesioPaymentSettings(mode, settings, country) {
  if (convesioSettings !== null) {
    return convesioSettings;
  }

  const baseUrl = getBaseConvesioApiUrl(mode);

  convesioSettings = fetch(
    `${baseUrl}/v1/payment-methods?integration=${encodeURIComponent(settings.integration)}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': settings.public_key,
      },
      body: JSON.stringify({
        merchantAccount: false,
        countryCode: country || 'US',
        shopperLocale: 'en-US',
        // shopperReference: email ? md5(email) : undefined,
      }),
    },
  ).then((res) => res.json());

  convesioSettings = await convesioSettings;

  return convesioSettings;
}

export function getBrowserInfo() {
  const screenWidth = window.screen?.width || 0;
  const screenHeight = window.screen?.height || 0;
  const colorDepth = window.screen?.colorDepth || 0;
  const userAgent = window.navigator?.userAgent || '';
  const javaEnabled = window.navigator?.javaEnabled?.() || false;
  const language = window.navigator?.language || '';
  const timeZoneOffset = new Date().getTimezoneOffset();

  return {
    acceptHeader: '*/*',
    colorDepth,
    language,
    javaEnabled,
    screenHeight,
    screenWidth,
    userAgent,
    timeZoneOffset,
  };
}
