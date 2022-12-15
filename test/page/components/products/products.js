import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isEmpty, map, find, findIndex, reduce, size } from 'lodash-es';
import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  FormControl,
  InputLabel,
  Select,
  IconButton,
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { AddCircle } from '@material-ui/icons';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  product: {
    width: '200px',
    height: '100px',
    marginTop: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productHeader: {
    padding: '2px 10px',
  },
  productContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 15px',
  },
  productsList: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  productOptions: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '60px',
    overflow: 'auto',
  },
  formControl: {
    margin: '5px',
  },
  select: {
    fontSize: '14px',
    lineHeight: '16px',
  },
  addItemButton: {
    marginTop: '10px',
    padding: 0,
  },
};

class Products extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      productsOptions: {},
      pages: null,
      page: 1,
      renderProducts: this.renderProducts.bind(this),
      onAddProduct: this.onAddProduct.bind(this),
      setProduct: this.setProduct.bind(this),
      onСhangePage: this.onСhangePage.bind(this),
    };
  }

  async loadProducts(params = {}) {
    const { api } = this.props;
    if (api) {
      const { products, pages, page } = await api.products
        .list(params)
        .then(({ results, pages, page }) => ({
          products: results,
          pages: size(pages),
          page,
        }));
      const productsOptions = this.initProductsOptions(products);
      this.setState({ products, productsOptions, pages, page });
    }
  }

  getDefaultProductOptions(product) {
    return reduce(
      product.options,
      (options, option) => {
        options.push({
          name: option.name,
          value: option.values && option.values.length && option.values[0].name,
        });
        return options;
      },
      [],
    );
  }

  initProductsOptions(products = []) {
    return reduce(
      products,
      (options, product) => {
        if (!isEmpty(product.options)) {
          options[product.id] = this.getDefaultProductOptions(product);
        }
        return options;
      },
      {},
    );
  }

  onAddProduct(productId) {
    const { onAddProduct } = this.props;
    const { products, productsOptions, getDefaultProductOptions } = this.state;
    const product = find(products, { id: productId });
    if (!product) {
      return;
    }
    onAddProduct({
      product_id: productId,
      quantity: 1,
      ...(!isEmpty(product.options)
        ? { options: productsOptions[productId] }
        : {}),
    });
  }

  setProduct({ target }) {
    const { productsOptions } = this.state;
    const option = { name: target.name, value: target.value };
    let productOptions = productsOptions[target.id];
    if (productOptions) {
      const optionIndex = findIndex(productOptions, { name: target.name });
      if (optionIndex !== -1) {
        productOptions[optionIndex] = option;
      } else {
        productOptions.push(option);
      }
    } else {
      productOptions = [option];
    }
    this.setState({
      productsOptions: {
        ...productsOptions,
        [target.id]: productOptions,
      },
    });
  }

  onСhangePage(event, value) {
    this.loadProducts({ page: value });
  }

  renderProduct(product) {
    const { classes } = this.props;
    const { onAddProduct, setProduct } = this.state;

    return (
      <Card key={product.id} classes={{ root: classes.product }}>
        <CardHeader
          subheader={product.name}
          classes={{ root: classes.productHeader }}
          action={
            <IconButton
              classes={{ root: classes.addItemButton }}
              onClick={() => onAddProduct(product.id)}>
              <AddCircle />
            </IconButton>
          }
        />
        <CardContent classes={{ root: classes.productContent }}>
          {!isEmpty(product.options) ? (
            <div className={classes.productOptions}>
              {map(product.options, (option) => (
                <FormControl
                  key={option.id}
                  classes={{ root: classes.formControl }}>
                  <InputLabel htmlFor={`${option.id}-${option.name}`}>
                    {option.name}
                  </InputLabel>
                  <Select
                    autoWidth
                    native
                    onChange={setProduct}
                    inputProps={{
                      name: option.name,
                      id: `${product.id}`,
                    }}
                    classes={{ root: classes.select }}>
                    {map(option.values, (value) => (
                      <option key={value.id} value={value.name}>
                        {value.name} (
                        {value.price || product.sale_price || product.price}{' '}
                        {product.currency})
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </div>
          ) : (
            <Typography>
              {product.sale_price || product.price} {product.currency}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  renderProducts() {
    const { classes } = this.props;
    const { products } = this.state;
    if (isEmpty(products)) {
      this.loadProducts();
    } else {
      return (
        <div className={classes.productsList}>
          {map(products, (product) => this.renderProduct(product))}
        </div>
      );
    }
  }

  render() {
    const { classes } = this.props;
    const { onСhangePage, renderProducts, pages, page } = this.state;

    return (
      <div className={classes.root}>
        {renderProducts()}
        {pages > 0 && (
          <Pagination
            count={pages}
            page={page}
            variant="outlined"
            shape="rounded"
            size="large"
            color="primary"
            onChange={onСhangePage}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ api }) => ({
  api,
});

export default compose(connect(mapStateToProps), withStyles(styles))(Products);
