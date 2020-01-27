import React from 'react';
import ReactDOM from 'react-dom';
import { withStyles } from '@material-ui/core/styles';
import { Container, Grid, Typography } from '@material-ui/core';
import Checkout from '../../components/checkout';
import BraintreePayPal from './braintree-paypal';
import Stripe from './stripe';

const styles = {};

class Payment extends React.Component {
  constructor(props) {
    super(props);
  }

  renderGataway() {
    const { gateway } = this.props;

    switch (gateway) {
      case 'braintree-paypal':
        return <BraintreePayPal />;
      case 'stripe':
        return <Stripe />;
      case 'square':
        return <Typography variant="h4">Coming soon</Typography>;
      case 'braintree':
        return <Typography variant="h4">Coming soon</Typography>;
      default:
        return <Typography variant="h4">Not Found</Typography>;
    }
  }

  render() {
    return (
      <Container>
        <Grid container direction="row" justify="center" alignItems="stretch" spacing={10}>
          <Grid item xs={5}>
            <Checkout />
          </Grid>
          <Grid item xs={5}>
            {this.renderGataway()}
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withStyles(styles)(Payment);
