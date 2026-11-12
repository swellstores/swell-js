import { isServer } from './utils';

const PURPOSES = ['analytics', 'marketing', 'sale_of_data'];

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

function methods(api) {
  // Calls run one after another. Consent tools fire several events for one
  // answer, and the first call may set the visitor cookie that the next one
  // has to send: in parallel, each would start a visitor of its own.
  let queue = Promise.resolve();

  return {
    /**
     * Records the shopper's consent for attribution, from the storefront's
     * consent banner. Purposes left out stay as they are.
     *
     * Calls the storefront's own origin, so that Swell sees the page's
     * cookies and sets the visitor cookie on the storefront's domain.
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

      const result = queue.then(() =>
        api.request(
          'put',
          '/session/consent',
          { ...data, landing: getLanding() },
          undefined,
          { fullUrl: `${window.location.origin}/api/session/consent` },
        ),
      );

      // A failed call doesn't hold back the next one
      queue = result.catch(() => undefined);

      return result;
    },
  };
}

export default methods;
