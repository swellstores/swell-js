import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
import { get, isEqual } from 'lodash-es';
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
    const { api, onError } = this.props;
    api.payment.handleRedirect({
      klarna: { onError, onSuccess: () => this.setState({ tokenized: true }) },
    });
  }

  onClickTokenize(event) {
    event.preventDefault();
    const { api, onError } = this.props;

    api.payment.tokenize({
      klarna: {
        onError,
      },
    });
  }

  isTokinized(cart) {
    return !!get(cart, 'billing.klarna.token');
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
