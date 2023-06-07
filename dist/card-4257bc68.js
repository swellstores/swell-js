import { j as toSnake, F as vaultRequest } from './index-ca9cb73c.js';

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

    const parts = new String(value).split(/[\s\/\-]+/, 2);
    const month = parts[0];
    let year = parts[1];

    // Convert 2 digit year
    if (year && year.length === 2 && /^\d+$/.test(year)) {
      const prefix = new Date().getFullYear().toString().substring(0, 2);
      year = prefix + year;
    }

    return {
      month: ~~month,
      year: ~~year,
    };
  },

  types() {
    let e, t, n, r;
    t = {};
    for (e = n = 40; n <= 49; e = ++n) t[e] = 'Visa';
    for (e = r = 50; r <= 59; e = ++r) t[e] = 'MasterCard';
    return (
      (t[34] = t[37] = 'American Express'),
      (t[60] = t[62] = t[64] = t[65] = 'Discover'),
      (t[35] = 'JCB'),
      (t[30] = t[36] = t[38] = t[39] = 'Diners Club'),
      t
    );
  },

  type(num) {
    return this.types()[num.slice(0, 2)] || 'Unknown';
  },

  luhnCheck(num) {
    let t, n, r, i, s, o;
    (r = !0), (i = 0), (n = (num + '').split('').reverse());
    for (s = 0, o = n.length; s < o; s++) {
      (t = n[s]), (t = parseInt(t, 10));
      if ((r = !r)) t *= 2;
      t > 9 && (t -= 9), (i += t);
    }
    return i % 10 === 0;
  },

  validateNumber(num) {
    return (
      (num = (num + '').replace(/\s+|-/g, '')),
      num.length >= 10 && num.length <= 16 && this.luhnCheck(num)
    );
  },

  validateExpiry(month, year) {
    let r, i;
    return (
      (month = String(month).trim()),
      (year = String(year).trim()),
      /^\d+$/.test(month)
        ? /^\d+$/.test(year)
          ? parseInt(month, 10) <= 12
            ? ((i = new Date(year, month)),
              (r = new Date()),
              i.setMonth(i.getMonth() - 1),
              i.setMonth(i.getMonth() + 1, 1),
              i > r)
            : !1
          : !1
        : !1
    );
  },

  validateCVC(val) {
    return (
      (val = String(val).trim()),
      /^\d+$/.test(val) && val.length >= 3 && val.length <= 4
    );
  },
};

export { cardApi as c };
