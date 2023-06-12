import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';

const styles = {};

class BraintreePayPal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { api, cart, onOrderSubmit, onError } = this.props;

    api.payment.createElements({
      paypal: {
        style: {
          layout: 'horizontal',
          color: 'blue',
          shape: 'rect',
          label: 'buynow',
          tagline: false,
        },
        require: {
          shipping: Boolean(cart.shipment_delivery),
        },
        onSuccess: () => onOrderSubmit(),
        onError: (err) => onError(err.message),
      },
    });
  }

  render() {
    return <div id="paypal-button" />;
  }
}

const mapStateToProps = ({ api, cart }) => ({
  api,
  cart,
});

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
)(BraintreePayPal);
