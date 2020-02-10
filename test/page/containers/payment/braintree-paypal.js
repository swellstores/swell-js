import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isEqual, isEmpty } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import Info from '../../components/info';

const styles = {};

class BraintreePayPal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payment: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.api && !isEqual(nextProps.checkout.id, this.props.checkout.id)) {
      this.renderBraintreePayPalButton(nextProps.api, nextProps.checkout.id);
    }
  }

  componentDidMount() {
    const { api, checkout: { id } = {} } = this.props;

    if (api && id) {
      this.renderBraintreePayPalButton(api, id);
    }
  }

  renderBraintreePayPalButton(api, checkout) {
    api.payment.createElements(
      {
        style: {
          layout: 'horizontal',
          color: 'blue',
          shape: 'rect',
          label: 'buynow',
          tagline: false,
        },
        onSuccess: (payment) => {
          this.setState({ payment });
        },
      },
      checkout,
    );
  }

  render() {
    const { payment } = this.state;

    return (
      <>
        <div id="paypal-button" />
        <Info source={payment} title="Payment:" />
      </>
    );
  }
}

const mapStateToProps = ({ api, checkout }) => ({
  api,
  checkout,
});

export default compose(connect(mapStateToProps), withStyles(styles))(BraintreePayPal);
