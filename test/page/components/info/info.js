import React from 'react';
import ReactDOM from 'react-dom';
import { map, isPlainObject, isEmpty, isArray } from 'lodash';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Divider, Card } from '@material-ui/core';

const styles = {
  card: {
    padding: 10,
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 10,
  },
};

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCard(source) {
    const { classes } = this.props;

    return (
      !isEmpty(source) && (
        <Card classes={{ root: classes.card }}>
          {map(source, (field, key) => (
            <Typography component={'span'} variant={'body2'}>
              {key}:{' '}
              {field === null
                ? 'null'
                : isPlainObject(field) || isArray(field)
                ? this.renderCard(field)
                : field.toString()}
            </Typography>
          ))}
        </Card>
      )
    );
  }

  render() {
    const { title, source, classes } = this.props;

    return (
      <>
        {source && title && <Typography classes={{ root: classes.title }}>{title}</Typography>}
        {this.renderCard(source)}
      </>
    );
  }
}

export default withStyles(styles)(Info);
