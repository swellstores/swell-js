import React from 'react';
import qs from 'qs';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { get, isEqual } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
import { removeUrlParams } from '../../utils';
import { isSaferpayCardPayment, getSaferpayCard } from '../../utils/saferpay';

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

class Saferpay extends React.Component {
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

  async componentDidMount() {
    const { cart, onCartUpdate, onUpdateIntent, onError } = this.props;
    debugger;
    const params = qs.parse(window.location.search, { ignoreQueryPrefix: true });
    if (params.gateway === 'saferpay') {
      removeUrlParams();
      const { redirect_status: status } = params;

      switch (status) {
        case 'succeeded':
          const token = get(cart, 'billing.intent.saferpay.token');
          if (!token) {
            return onError('Saferpay transaction token not defined.');
          }

          const intent = await onUpdateIntent({ gateway: 'saferpay', intent: { token } });

          if (!intent) {
            return;
          } else if (!isSaferpayCardPayment(intent.state)) {
            return onError('Payment method not supported by this gateway.');
          }

          return onCartUpdate({
            billing: {
              method: 'card',
              card: getSaferpayCard(intent.state),
            },
          });
        case 'canceled':
          return;
        case 'failed':
          return onError(
            'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
          );
        default:
          return onError(`Unknown redirect status: ${status}.`);
      }
    }
  }

  onClickTokenize(event) {
    const { api, onError } = this.props;

    event.preventDefault();
    api.payment.tokenize({
      card: {
        onError,
      },
    });
  }

  isTokinized(cart) {
    return get(cart, 'billing.card.gateway') === 'saferpay';
  }

  render() {
    const { classes, onOrderSubmit } = this.props;
    const { tokenized } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            <div id="card-element" className={classes.cardInput} />
            <div className={classes.submitContainer}>
              <Button
                id="submit-button"
                variant="contained"
                color="primary"
                size="small"
                classes={{ root: classes.button }}
                onClick={this.onClickTokenize.bind(this)}
              >
                Tokenize
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={!tokenized}
                classes={{ root: classes.button }}
                onClick={onOrderSubmit}
              >
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

export default compose(connect(mapStateToProps), withStyles(styles))(Saferpay);
