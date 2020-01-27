import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isEqual } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button, Typography, Divider } from '@material-ui/core';
import Info from '../../components/info';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardInput: {
    margin: 20,
  },
  card: {
    marginBottom: 20,
  },
  submitContainer: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: {
    width: '30%',
  },
};

class Stripe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      card: null,
      payment: null,
      createPayment: this.createPayment.bind(this),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.api) {
      this.renderStripeElements(nextProps.api);
    }
  }

  componentDidMount() {
    const { api } = this.props;

    if (api) {
      this.renderStripeElements(api);
    }
  }

  renderStripeElements(api) {
    api.payment.createElements({
      card: {
        options: {
          style: {
            base: {
              fontWeight: 500,
              fontSize: '16px',
            },
          },
        },
      },
      onDone: (card) => {
        this.setState({ card, payment: null });
      },
    });
  }

  async createPayment() {
    const { api, checkout: { order } = {} } = this.props;
    const { card } = this.state;

    const payment = await api.payment.create(order.id, order.grand_total, 'card', card);
    this.setState({ payment });
  }

  render() {
    const { classes, checkout: { order } = {} } = this.props;
    const { card, payment, createPayment } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            <div id="card-element" className={classes.cardInput} />
            <div className={classes.submitContainer}>
              <Button
                id="stripe-submit-button"
                variant="contained"
                color="primary"
                size="small"
                classes={{ root: classes.button }}
              >
                Tokenize
              </Button>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={!(order && card)}
                classes={{ root: classes.button }}
                onClick={createPayment}
              >
                Pay
              </Button>
            </div>
          </CardContent>
        </Card>
        <Info source={card} title="Card:" />
        <Info source={payment} title="Payment:" />
      </div>
    );
  }
}

const mapStateToProps = ({ api, checkout }) => ({
  api,
  checkout,
});

export default compose(connect(mapStateToProps), withStyles(styles))(Stripe);
