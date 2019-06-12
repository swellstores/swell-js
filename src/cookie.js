const { iSserver } = require('./utils');

function getCookie(name) {
  if (iSserver()) {
    return undefined;
  }

  let matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
  if (iSserver()) {
    return;
  }

  const date = new Date();

  date.setDate(date.getDate() + 7); // 1 week
  options = {
    path: '/',
    expires: date.toUTCString(),
    ...options,
  };

  if (options.expires && options.expires.toUTCString) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += '; ' + optionKey;
    let optionValue = options[optionKey];

    if (optionValue !== true) {
      updatedCookie += '=' + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

module.exports = {
  getCookie,
  setCookie,
};
