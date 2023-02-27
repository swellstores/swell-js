import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@material-ui/core';

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
      type: 'card',
      font: 'default',
    };

    this.onTokenize = this.onTokenize.bind(this);
    this.onError = this.onError.bind(this);
    this.onClickTokenize = this.onClickTokenize.bind(this);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeFont = this.onChangeFont.bind(this);
  }

  componentDidMount() {
    this.renderStripeElements();
  }

  renderStripeElements() {
    const { type, font } = this.state;
    const options = {
      showIcon: true,
      style: {
        base: {
          fontWeight: 500,
          fontSize: '16px',
        },
      },
    };

    switch (font) {
      case 'audiowide':
        options.style.base.fontFamily = 'Audiowide';
        break;
      case 'festive':
        options.style.base.fontFamily = 'Festive';
        break;
      default:
        break;
    }

    this.props.api.payment.createElements({
      config: {
        fonts: [
          {
            cssSrc: 'https://fonts.googleapis.com/css?family=Audiowide',
          },
          {
            cssSrc: 'https://fonts.googleapis.com/css?family=Festive',
          },
        ],
      },
      card: {
        ...(type === 'card'
          ? {
              options,
            }
          : {
              separateElements: true,
              cardNumber: { options },
              cardExpiry: { options },
              cardCvc: { options },
            }),
        onSuccess: this.onTokenize,
        onError: this.onError,
      },
    });
  }

  onTokenize() {
    this.setState({ tokenized: true });
  }

  onError(err) {
    this.props.onError(err.message);
  }

  onClickTokenize(event) {
    const { api } = this.props;

    event.preventDefault();
    api.payment.tokenize();
  }

  onChangeType(event, type) {
    this.setState({ type }, this.renderStripeElements);
  }

  onChangeFont(event, font) {
    this.setState({ font }, this.renderStripeElements);
  }

  render() {
    const { classes, onOrderSubmit } = this.props;
    const { tokenized, type } = this.state;

    return (
      <div className={classes.root}>
        <Card classes={{ root: classes.card }}>
          <CardContent>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <RadioGroup defaultValue="card" row onChange={this.onChangeType}>
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label="Card"
                />
                <FormControlLabel
                  value="separate"
                  control={<Radio />}
                  label="Separate elements"
                />
              </RadioGroup>
            </FormControl>
            <FormControl>
              <FormLabel>Font</FormLabel>
              <RadioGroup
                defaultValue="default"
                row
                onChange={this.onChangeFont}>
                <FormControlLabel
                  value="default"
                  control={<Radio />}
                  label="Default"
                />
                <FormControlLabel
                  value="audiowide"
                  control={<Radio />}
                  label="Audiowide"
                />
                <FormControlLabel
                  value="festive"
                  control={<Radio />}
                  label="Festive"
                />
              </RadioGroup>
            </FormControl>
            {type === 'card' ? (
              <div id="card-element" className={classes.cardInput} />
            ) : (
              <Fragment>
                <div id="cardNumber-element" className={classes.cardInput} />
                <div id="cardExpiry-element" className={classes.cardInput} />
                <div id="cardCvc-element" className={classes.cardInput} />
              </Fragment>
            )}
            <div className={classes.submitContainer}>
              <Button
                id="stripe-submit-button"
                variant="contained"
                color="primary"
                size="small"
                classes={{ root: classes.button }}
                onClick={this.onClickTokenize}>
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

export default compose(connect(mapStateToProps), withStyles(styles))(Stripe);
