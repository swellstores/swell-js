import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

const styles = {};

class PayPal extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { api, onOrderSubmit, onError } = this.props;
    api.payment.createElements({
      paypal: {
        style: {
          layout: 'horizontal',
          color: 'blue',
          shape: 'rect',
          label: 'buynow',
          tagline: false,
        },
        onSuccess: onOrderSubmit,
        onError: (err) => onError(err.message),
      },
    });
  }

  render() {
    return <div id="paypal-button" />;
  }
}

const mapStateToProps = ({ api }) => ({
  api,
});

export default compose(connect(mapStateToProps), withStyles(styles))(PayPal);
