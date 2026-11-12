import SaferpayPayment from '../saferpay';

export default class SaferpayCardPayment extends SaferpayPayment {
  constructor(api, options, params, methods) {
    super(api, options, params, methods, 'card');
  }
}
