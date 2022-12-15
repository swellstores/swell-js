import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
import { get, isEqual } from 'lodash-es';
import qs from 'qs';
import { removeUrlParams } from '../../utils';
import Info from '../../components/info';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    margin: 20,
  },
  card: {
    marginBottom: 20,
    overflow: 'visible',
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    width: '30%',
  },
};

class StripeKlarna extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenized: this.isTokinized(props.cart),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.cart, nextProps.cart)) {
      this.setState({ tokenized: this.isTokinized(nextProps.cart) });
    }
  }

  componentDidMount() {
    const { cart, onCartUpdate, onError } = this.props;
    const params = qs.parse(window.location.search);
    if (cart.billing.method === 'klarna' && params.redirect_status) {
      removeUrlParams();
      if (params.redirect_status === 'succeeded') {
        return onCartUpdate({
          billing: {
            ...cart.billing,
            klarna: {
              source: params.source,
            },
          },
        });
      } else if (params.redirect_status === 'canceled') {
        onError('Your payment was canceled.');
      } else {
        onError(
          'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
        );
      }
    }
  }

  onClickTokenize(event) {
    const { api, onError } = this.props;

    event.preventDefault();
    api.payment.tokenize({
      klarna: {
        onError,
      },
    });
  }

  isTokinized(cart) {
    return !!get(cart, 'billing.klarna.source');
  }

  render() {
    const {
      classes,
      onOrderSubmit,
      cart: { billing: { method, klarna } = {} },
    } = this.props;
    const { tokenized } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            {tokenized && <Info title="Billing" source={{ method, klarna }} />}
            <div className={classes.submitContainer}>
              <Button
                id="stripe-submit-button"
                variant="contained"
                color="primary"
                size="small"
                classes={{ root: classes.button }}
                onClick={this.onClickTokenize.bind(this)}>
                Tokenize
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={!tokenized}
                classes={{ root: classes.button }}
                onClick={onOrderSubmit}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = ({ api }) => ({
  api,
});

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
)(StripeKlarna);
