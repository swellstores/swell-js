import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
import { get, isEqual } from 'lodash';
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

class StripeIDeal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bankSelected: false,
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
    if (cart.billing.method === 'ideal' && params.redirect_status) {
      removeUrlParams();
      if (params.redirect_status === 'succeeded') {
        return onCartUpdate({
          billing: {
            ...cart.billing,
            intent: {
              stripe: {
                ...get(cart, 'billing.intent.stripe', {}),
                status: 'requires_confirmation',
              }
            },
          },
        });
      }
      onError(
        'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
      );
    }
    this.createIDealElements();
  }

  createIDealElements() {
    const { api, onError } = this.props;
    api.payment.createElements({
      ideal: {
        options: {
          style: {
            base: {
              fontWeight: 500,
              fontSize: '16px',
            },
          },
        },
        onChange: () => this.setState({ bankSelected: true }),
        onError: (err) => onError(err.message),
      },
    });
  }

  onClickTokenize(event) {
    const { api } = this.props;

    event.preventDefault();
    api.payment.tokenize();
  }

  isTokinized(cart) {
    return get(cart, 'billing.intent.stripe.status') === 'requires_confirmation';
  }

  render() {
    const {
      classes,
      onOrderSubmit,
      cart: { billing: { method, ideal, intent } = {} },
    } = this.props;
    const { bankSelected, tokenized } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            {!tokenized ? (
              <div id="idealBank-element" className={classes.input} />
            ) : (
              <Info title="Billing" source={{ method, ideal, intent }} />
            )}
            <div className={classes.submitContainer}>
              {!tokenized ? (
                <Button
                  id="stripe-submit-button"
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={!bankSelected}
                  classes={{ root: classes.button }}
                  onClick={this.onClickTokenize.bind(this)}
                >
                  Tokenize
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  classes={{ root: classes.button }}
                  onClick={onOrderSubmit}
                >
                  Submit
                </Button>
              )}
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

export default compose(connect(mapStateToProps), withStyles(styles))(StripeIDeal);
