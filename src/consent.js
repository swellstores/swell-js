import { isServer } from './utils';

const PURPOSES = ['analytics', 'marketing', 'sale_of_data'];

// The click ids and ad cookies Swell records, as the storefront gateway reads
// them. Click ids in lowercase: the gateway reads them in any case.
const CLICK_ID_PARAMS = new Set([
  'ttclid',
  'fbclid',
  'gclid',
  'gbraid',
  'wbraid',
  'msclkid',
  'epik',
  'sccid',
  'rdt_cid',
  'twclid',
  'li_fat_id',
]);
const AD_COOKIES = [
  '_ttp',
  '_fbp',
  '_fbc',
  '_epik',
  '_scid',
  '_rdt_uuid',
  '_gcl_aw',
  '_gcl_gb',
  '_uetmsclkid',
];

// The store's API host, `<store>.swell.store`
const SWELL_API_DOMAIN = '.swell.store';

const VISITOR_COOKIE = 'swell-visitor';
// What the tab keeps of an API host, in `sessionStorage` under
// `swell-consent-<flag>:<API origin>`:
// - `direct`: the storefront's origin isn't Swell's, the calls go to the host;
// - `off`: the store records no attribution, no landing is sent.
const TAB_KEY_PREFIX = 'swell-consent-';
// The code of Swell's refusal of a call that the storefront's proxy forwarded
const ORIGIN_REQUIRED = 'storefront_origin_required';
const VISITOR_MAX_AGE = 90 * 24 * 60 * 60; // s

// The landings recorded from this page, by any client
const recordedLandings = new Set();

/**
 * The page the shopper landed on, which the consent call sends along: the
 * first URL of this document and its referrer. Read when needed, so nothing
 * is kept before the shopper answers.
 *
 * @returns {{url: string, referrer: string} | undefined}
 */
function getLanding() {
  if (isServer()) {
    return undefined;
  }

  let url = window.location.href;

  try {
    const [navigation] = window.performance.getEntriesByType('navigation');
    if (navigation?.name) {
      url = navigation.name;
    }
  } catch {
    // Navigation timing is not available
  }

  return { url, referrer: window.document.referrer || '' };
}

/**
 * @param {string} url
 * @returns {boolean} whether the URL has a click id or a UTM tag
 */
function hasLandingSignal(url) {
  try {
    for (const name of new URL(url).searchParams.keys()) {
      const lower = name.toLowerCase();
      if (CLICK_ID_PARAMS.has(lower) || lower.startsWith('utm_')) {
        return true;
      }
    }
  } catch {
    // Not a URL
  }

  return false;
}

/**
 * @param {unknown} result
 * @returns {boolean} whether a response is Swell's answer to a consent call
 */
function isConsentAnswer(result) {
  return (
    Boolean(result) &&
    typeof result === 'object' &&
    typeof result.effective === 'object'
  );
}

/**
 * Whether the storefront's origin answered a consent call, but not for
 * Swell: not found, a page that is no answer of Swell's, or Swell's refusal
 * of a call its proxy forwarded, which has its own code. A network failure or
 * a server error says nothing of the origin.
 *
 * @param {Error & {status?: number, code?: string}} err
 * @returns {boolean}
 */
function isNotSwellOrigin(err) {
  return (
    err.code === 'not_swell' ||
    err.code === ORIGIN_REQUIRED ||
    err.status === 404 ||
    err.status === 405
  );
}

/**
 * Consent calls. Swell records the shopper's consent, and the ad landing,
 * where it sees the storefront's own cookies: on the storefront's origin,
 * whose pages and `/api` Swell serves. A headless storefront serves its
 * pages itself: its origin doesn't answer, so the calls go straight to the
 * store's API host instead, with the page's ad cookies, and the visitor
 * cookie is set here.
 */
function methods(api, options) {
  // Calls run one after another. Consent tools fire several events for one
  // answer, and the first call may set the visitor cookie that the next one
  // has to send: in parallel, each would start a visitor of its own.
  let queue = Promise.resolve();
  // Whether the storefront's origin answered, but not for Swell: then the
  // calls go to the API host. Kept for the browser tab, so that each page of
  // a headless storefront doesn't ask its origin again.
  let direct = false;
  // Whether the store records no attribution: then no landing is sent. Kept
  // for the browser tab too.
  let off = false;

  function enqueue(call) {
    const result = queue.then(call);
    // A failed call doesn't hold back the next one
    queue = result.catch(() => undefined);
    return result;
  }

  function getApiOrigin() {
    try {
      return new URL(options.url).origin;
    } catch {
      return null;
    }
  }

  /**
   * @returns {boolean} whether the calls may go straight to the store's API
   *   host: it's another origin than the page's, and Swell's own. A `url` of
   *   the storefront's server would forward the calls, with its IP and
   *   country for the shopper's.
   */
  function canCallDirect() {
    const origin = getApiOrigin();

    return (
      Boolean(origin) &&
      origin !== window.location.origin &&
      new URL(origin).hostname.endsWith(SWELL_API_DOMAIN)
    );
  }

  /**
   * @param {'direct' | 'off'} flag
   * @returns {boolean} whether the tab keeps the flag for the API host
   */
  function readTab(flag) {
    try {
      return (
        window.sessionStorage.getItem(
          `${TAB_KEY_PREFIX}${flag}:${getApiOrigin()}`,
        ) === '1'
      );
    } catch {
      return false;
    }
  }

  /**
   * @param {'direct' | 'off'} flag
   */
  function keepTab(flag) {
    try {
      window.sessionStorage.setItem(
        `${TAB_KEY_PREFIX}${flag}:${getApiOrigin()}`,
        '1',
      );
    } catch {
      // Storage is not available: the next page asks again
    }
  }

  async function callOrigin(data) {
    const result = await api.request(
      'put',
      '/session/consent',
      data,
      undefined,
      { fullUrl: `${window.location.origin}/api/session/consent` },
    );

    if (!isConsentAnswer(result)) {
      const err = new Error('The storefront origin is not served by Swell');
      err.code = 'not_swell';
      throw err;
    }

    return result;
  }

  async function callDirect(data) {
    const cookies = {};
    for (const name of AD_COOKIES) {
      const value = options.getCookie(name);
      if (value) {
        cookies[name] = value;
      }
    }

    const { visitor, ...result } =
      (await api.request('put', '/session/consent', {
        ...data,
        cookies,
        direct: true,
      })) || {};

    // The cookie that swell-js sends as X-Visitor. Swell has recorded the
    // call: a cookie that can't be set doesn't fail it
    if (visitor) {
      try {
        options.setCookie(VISITOR_COOKIE, visitor, {
          'max-age': VISITOR_MAX_AGE,
          ...(window.location.protocol === 'https:' ? { secure: true } : {}),
        });
      } catch {
        // The page's cookie adapter can't write here
      }
    }

    return result;
  }

  async function call(body) {
    if (!direct) {
      try {
        return await callOrigin(body);
      } catch (err) {
        if (!isNotSwellOrigin(err) || !canCallDirect()) {
          throw err;
        }

        direct = true;
        keepTab('direct');
      }
    }

    return callDirect(body);
  }

  async function send(data) {
    const result = await call({ ...data, landing: getLanding() });

    if (result?.capture === false && !off) {
      off = true;
      keepTab('off');
    }

    return result;
  }

  function recordLanding() {
    try {
      const landing = getLanding();
      const key = `${options.url} ${landing.url}`;

      if (off || !hasLandingSignal(landing.url) || recordedLandings.has(key)) {
        return;
      }

      recordedLandings.add(key);
      enqueue(() => send({})).catch(() => undefined);
    } catch {
      // Attribution never breaks the storefront
    }
  }

  return {
    /**
     * Records the shopper's consent for attribution, from the storefront's
     * consent banner. Purposes left out stay as they are.
     *
     * Calls the storefront's own origin, so that Swell sees the page's
     * cookies and sets the visitor cookie on the storefront's domain. On a
     * headless storefront, it calls the store's API host.
     *
     * @param {{analytics?: boolean, marketing?: boolean, sale_of_data?: boolean}} consent
     */
    set(consent = {}) {
      if (isServer()) {
        return Promise.reject(new Error('consent.set() runs in the browser'));
      }

      const data = {};

      for (const purpose of PURPOSES) {
        // camelCase clients pass saleOfData
        const camel = purpose.replace(/_(\w)/g, (_m, c) => c.toUpperCase());
        const value = consent[purpose] ?? consent[camel];

        if (typeof value === 'boolean') {
          data[purpose] = value;
        }
      }

      return enqueue(() => send(data));
    },

    /**
     * On init: records an ad landing (a click id or a UTM tag in the URL)
     * without an answer, where no answer is needed. Swell records it itself
     * when it serves the page: this covers a headless storefront, and a page
     * Swell served from its cache. Once per landing; with the API on the
     * page's own origin, Swell served the page. After the page's load, when
     * the ad pixels have set their cookies. Not once Swell answered in the
     * tab that the store records nothing (`capture: false`).
     */
    init() {
      direct = false;
      off = false;

      try {
        if (isServer() || !canCallDirect()) {
          return;
        }

        direct = readTab('direct');
        off = readTab('off');

        const { readyState } = window.document;
        if (readyState === 'loading' || readyState === 'interactive') {
          window.addEventListener('load', recordLanding, { once: true });
        } else {
          recordLanding();
        }
      } catch {
        // Attribution never breaks the storefront
      }
    },
  };
}

export default methods;
