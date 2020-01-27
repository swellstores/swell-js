import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import { Button, Input, IconButton, Paper, Typography, Divider, Popover } from '@material-ui/core';
import { ShoppingCart } from '@material-ui/icons';
import checkout from '../../actions/checkout';
import Info from '../info';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkoutInput: {
    display: 'flex',
    width: '100%',
    marginBottom: 20,
  },
};

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputRef: React.createRef(),
      onSetCheckout: this.onSetCheckout.bind(this),
    };
  }

  async onSetCheckout() {
    const { onSetCheckout, api, setCheckout } = this.props;
    const { inputRef } = this.state;
    const checkout = inputRef.current.value;

    const order = await api.cart.getOrder(checkout);
    if (order) {
      setCheckout(checkout, order);
    }
  }

  render() {
    const { classes, checkout } = this.props;
    const { inputRef, onSetCheckout } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.checkoutInput}>
          <Input fullWidth inputRef={inputRef} placeholder="Checkout ID" />
          <IconButton onClick={onSetCheckout}>
            <ShoppingCart />
          </IconButton>
        </div>
        <Info source={checkout.order} />
      </div>
    );
  }
}

const mapStateToProps = ({ api, checkout }) => ({
  api,
  checkout,
});

const mapDispatchToProps = (dispatch) => ({
  setCheckout: (id, order) => {
    dispatch(checkout.set(id, order));
  },
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withStyles(styles))(Checkout);
