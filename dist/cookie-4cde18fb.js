import { q as isServer } from './index-ca9cb73c.js';

const COOKIE_MAX_AGE = 604800; // 1 week

function getCookie(name) {
  if (isServer()) {
    return undefined;
  }

  const matches = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/([.$?*|{}()[]\\\/\+^])/g, '\\$1') + '=([^;]*)',
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  if (isServer()) {
    return;
  }

  // default cookie options, which can be overridden
  options = {
    path: '/',
    'max-age': COOKIE_MAX_AGE,
    samesite: 'lax',
    ...options,
  };

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie =
    encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (const optionKey in options) {
    updatedCookie += '; ' + optionKey;
    const optionValue = options[optionKey];

    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

export { getCookie as g, setCookie as s };
