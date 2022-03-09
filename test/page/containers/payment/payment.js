import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isEqual, isEmpty, map, find } from 'lodash';
import { withStyles } from '@material-ui/core/styles';
import {
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
} from '@material-ui/core';
import { RemoveCircle } from '@material-ui/icons';
import cartActions from '../../actions/cart';
import flashActions from '../../actions/flash';
import Products from '../../components/products';
import PayPal from './paypal';
import BraintreePayPal from './braintree-paypal';
import Stripe from './stripe';
import StripeIDeal from './stripe-ideal';
import StripeKlarna from './stripe-klarna';
import StripeBancontact from './stripe-bancontact';
import Quickpay from './quickpay';
import Paysafecard from './paysafecard';
import Klarna from './klarna';
import Info from '../../components/info';

const styles = {
  cart: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cartHeader: {
    padding: '2px 10px',
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    width: '200px',
    height: '100px',
    margin: '5px 5px 0 0',
  },
  itemHeader: {
    padding: '2px 10px',
  },
  removeItemButton: {
    marginTop: '10px',
    padding: 0,
  },
  divider: {
    margin: '10px 0',
  },
};

class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: null,
      cartProducts: [],
      onAddProduct: this.onAddProduct.bind(this),
      onRemoveItem: this.onRemoveItem.bind(this),
      onOrderSubmit: this.onOrderSubmit.bind(this),
      onCartUpdate: this.onCartUpdate.bind(this),
      onError: this.onError.bind(this),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.api && !isEqual(this.props.api, nextProps.api)) {
      this.props.initCart();
    }
    if (nextProps.cart && !isEqual(this.props.cart, nextProps.cart)) {
      this.initCartProducts(nextProps.cart.items);
    }
    if (nextProps.gateway && !isEqual(this.props.gateway, nextProps.gateway)) {
      this.setState({ order: null });
    }
  }

  componentDidMount() {
    const { api } = this.props;
    api && this.props.initCart();
  }

  async initCartProducts(items) {
    const { api } = this.props;

    const cartProducts = await Promise.all(
      map(items, (item) => new Promise((resolve) => resolve(api.products.get(item.product_id)))),
    );
    this.setState({ cartProducts });
  }

  async onAddProduct(product) {
    this.props.addItem(product);
  }

  async onRemoveItem(itemId) {
    this.props.removeItem(itemId);
  }

  async onCartUpdate(values) {
    try {
      await this.props.updateCart(values);
    } catch (err) {
      this.onError(err.message);
    }
  }

  async onOrderSubmit() {
    try {
      const order = await this.props.submitOrder();
      this.setState({ order });
    } catch (err) {
      this.onError(err.message);
    }
  }

  onError(error) {
    if (!error) {
      return;
    }

    return typeof error === 'string' ? this.props.error(error) : this.props.error(error.message);
  }

  renderGateway() {
    const { gateway, cart } = this.props;
    const { onOrderSubmit, onCartUpdate, onError } = this.state;

    switch (gateway) {
      case 'paypal':
        return <PayPal onOrderSubmit={onOrderSubmit} onError={onError} />;
      case 'braintree-paypal':
        return <BraintreePayPal onOrderSubmit={onOrderSubmit} onError={onError} />;
      case 'stripe':
        return <Stripe onOrderSubmit={onOrderSubmit} onError={onError} />;
      case 'stripe-ideal':
        return (
          <StripeIDeal
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'stripe-klarna':
        return (
          <StripeKlarna
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'stripe-bancontact':
        return (
          <StripeBancontact
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'quickpay':
        return (
          <Quickpay
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'paysafecard':
        return (
          <Paysafecard
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'klarna':
        return (
          <Klarna
            cart={cart}
            onCartUpdate={onCartUpdate}
            onOrderSubmit={onOrderSubmit}
            onError={onError}
          />
        );
      case 'square':
        return <Typography variant="h4">Coming soon</Typography>;
      case 'braintree':
        return <Typography variant="h4">Coming soon</Typography>;
      default:
        return <Typography variant="h4">Not Found</Typography>;
    }
  }

  renderItems(items) {
    const { cartProducts, onRemoveItem } = this.state;
    const { classes } = this.props;

    return (
      !isEmpty(cartProducts) && (
        <div className={classes.items}>
          {map(items, (item) => {
            const product = find(cartProducts, { id: item.product_id });
            return (
              product && (
                <Card key={product.id} classes={{ root: classes.item }}>
                  <CardHeader
                    subheader={product.name}
                    classes={{ root: classes.itemHeader }}
                    action={
                      <IconButton
                        classes={{ root: classes.removeItemButton }}
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <RemoveCircle />
                      </IconButton>
                    }
                  />
                  <CardContent classes={{ root: classes.productContent }}>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>
                      Price: {item.price_total} {product.currency}
                    </Typography>
                  </CardContent>
                </Card>
              )
            );
          })}
        </div>
      )
    );
  }

  renderCart() {
    const { classes, cart } = this.props;

    return (
      <Card classes={{ root: classes.cart }}>
        <CardHeader classes={{ root: classes.cartHeader }} subheader={`Cart ID: ${cart.id}`} />
        <CardContent>
          {this.renderItems(cart.items)}
          <Divider classes={{ root: classes.divider }} />
          <Typography>Tax: {cart.tax_total ? cart.tax_total.toFixed(2) : 0}</Typography>
          <Typography>
            Discount: {cart.discount_total ? cart.discount_total.toFixed(2) : 0}
          </Typography>
          <Typography>Total: {cart.grand_total ? cart.grand_total.toFixed(2) : 0}</Typography>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { onAddProduct, order } = this.state;
    const { cart, api } = this.props;

    return (
      api && (
        <Grid container direction="row" justify="center" alignItems="stretch" spacing={10}>
          <Grid item xs={5}>
            <Products onAddProduct={onAddProduct} />
          </Grid>
          {(cart || order) && (
            <Grid item xs={5}>
              {cart && (
                <>
                  {this.renderCart()}
                  {this.renderGateway()}
                </>
              )}
              {order && !cart && <Info source={order} title="Order:" />}
            </Grid>
          )}
        </Grid>
      )
    );
  }
}

const mapStateToProps = ({ api, cart, user }) => ({
  api,
  cart,
  user,
});

const mapDispatchToProps = (dispatch) => ({
  initCart: () => {
    dispatch(cartActions.initCart());
  },
  addItem: (product) => {
    dispatch(cartActions.addItem(product));
  },
  removeItem: (itemId) => {
    dispatch(cartActions.removeItem(itemId));
  },
  updateCart: (values) => {
    dispatch(cartActions.update(values));
  },
  submitOrder: async () => {
    return await dispatch(cartActions.submitOrder());
  },
  error: (message) => {
    dispatch(flashActions.error(message));
  },
  warning: (message) => {
    dispatch(flashActions.warning(message));
  },
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withStyles(styles))(Payment);
