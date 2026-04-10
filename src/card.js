import { vaultRequest, toSnake } from './utils';

const cardApi = {
  async createToken(data) {
    let error = null;
    let code = null;
    let param = null;
    if (!data) {
      error = 'Card details are missing in `swell.card.createToken(card)`';
      param = '';
    }
    const card = toSnake(data);
    if (!card.nonce) {
      if (!this.validateNumber(card.number)) {
        error = 'Card number appears to be invalid';
        code = 'invalid_card_number';
        param = 'number';
      }
      if (card.exp) {
        const exp = this.expiry(card.exp);
        card.exp_month = exp.month;
        card.exp_year = exp.year;
      }
      if (!this.validateExpiry(card.exp_month, card.exp_year)) {
        error = 'Card expiry appears to be invalid';
        code = 'invalid_card_expiry';
        param = 'exp_month';
      }
      if (!this.validateCVC(card.cvc)) {
        error = 'Card CVC code appears to be invalid';
        code = 'invalid_card_cvc';
        param = 'exp_cvc';
      }
    }

    if (error) {
      const err = new Error(error);
      err.code = code || 'invalid_card';
      err.status = 402;
      err.param = param;
      throw err;
    }

    // Get a token from the vault
    const result = await vaultRequest('post', '/tokens', card);
    if (result.errors) {
      const param = Object.keys(result.errors)[0];
      const err = new Error(result.errors[param].message || 'Unknown error');
      err.code = 'vault_error';
      err.status = 402;
      err.param = param;
      throw err;
    }
    return result;
  },

  expiry(value) {
    if (value && value.month && value.year) {
      return value;
    }

    const parts = new String(value).split(/[\s/-]+/, 2);
    const month = parts[0];

    const currentYear = new Date().getUTCFullYear().toString();
    let strYear = parts[1];

    if (strYear.length < currentYear.length) {
      let fullYear =
        currentYear.slice(0, currentYear.length - strYear.length) + strYear;

      // If the expiration year is less than the current year,
      // then the expiration year is in the next century.
      if (fullYear < currentYear) {
        let year = Number(fullYear);
        year += 10 ** strYear.length;
        fullYear = year.toString();
      }

      strYear = fullYear;
    }

    return {
      month: Number.parseInt(month, 10),
      year: Number.parseInt(strYear, 10),
    };
  },

  types() {
    let t = {};
    for (let e = 40; e <= 49; ++e) t[e] = 'Visa';
    for (let e = 50; e <= 59; ++e) t[e] = 'MasterCard';
    t[34] = t[37] = 'American Express';
    t[60] = t[62] = t[64] = t[65] = 'Discover';
    t[35] = 'JCB';
    t[30] = t[36] = t[38] = t[39] = 'Diners Club';
    return t;
  },

  type(num) {
    return this.types()[num.slice(0, 2)] || 'Unknown';
  },

  luhnCheck(num) {
    const numbers = String(num);
    let odd = false;
    let sum = 0;

    for (let i = numbers.length - 1; i >= 0; --i) {
      let digit = Number.parseInt(numbers[i], 10);

      if (odd) {
        digit *= 2;

        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      odd = !odd;
    }

    return sum % 10 === 0;
  },

  validateNumber(num) {
    num = String(num).replace(/\s+|-/g, '');

    return num.length >= 10 && num.length <= 16 && this.luhnCheck(num);
  },

  validateExpiry(month, year) {
    month = String(month).trim();
    year = String(year).trim();

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
      return false;
    }

    const numMonth = Number.parseInt(month, 10);

    if (numMonth <= 0 || numMonth > 12) {
      return false;
    }

    const date = new Date(year, month);
    date.setMonth(date.getMonth() - 1);
    date.setMonth(date.getMonth() + 1, 1);

    const diff = date.getTime() - Date.now();

    // The card has expired
    if (diff < 0) {
      return false;
    }

    // The card's validity period must not exceed 75 years from the current time.
    return Math.round(diff / 31_557_600_000) < 75;
  },

  validateCVC(val) {
    val = String(val).trim();

    return /^\d+$/.test(val) && val.length >= 3 && val.length <= 4;
  },
};

export default cardApi;
