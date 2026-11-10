import SaferpayPayment from '../saferpay';

export default class SaferpayTwintPayment extends SaferpayPayment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods, 'twint');
  }
}
