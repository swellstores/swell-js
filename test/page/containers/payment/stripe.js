import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Button } from '@material-ui/core';

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
      tokenized: false,
    };
  }

  componentDidMount() {
    const { api, onError } = this.props;
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
        onSuccess: () => {
          this.setState({ tokenized: true });
        },
        onError: (err) => onError(err.message),
      },
    });
  }

  onClickTokenize(event) {
    const { api } = this.props;

    event.preventDefault();
    api.payment.tokenize();
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
                id="stripe-submit-button"
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

export default compose(connect(mapStateToProps), withStyles(styles))(Stripe);
