import * as React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';
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

class Paysafecard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokenized: false,
    };
  }

  componentDidMount() {
    const { api, onError } = this.props;
    api.payment.handleRedirect({
      paysafecard: {
        onError,
        onSuccess: () => this.setState({ tokenized: true }),
      },
    });
  }

  onClickTokenize(event) {
    const { api, onError } = this.props;

    event.preventDefault();
    api.payment.tokenize({
      paysafecard: {
        onError,
      },
    });
  }

  render() {
    const {
      classes,
      onOrderSubmit,
      cart: { billing: { method, intent } = {} },
    } = this.props;
    const { tokenized } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            {tokenized && <Info title="Billing" source={{ method, intent }} />}
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
)(Paysafecard);
