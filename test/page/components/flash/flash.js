import React from 'react';
import ReactDOM from 'react-dom';
import { map, isPlainObject, isEmpty, isArray } from 'lodash-es';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Card } from '@material-ui/core';

const styles = {
  flashContainer: {
    position: 'fixed',
    bottom: '10px',
    left: '30%',
    right: '30%',
  },
  card: {
    wordBreak: 'break-all',
    textAlign: 'center',
    color: 'white',
    padding: '10px',
  },
  error: { backgroundColor: '#b71540' },
  warning: { backgroundColor: '#EE5A24' },
  success: { backgroundColor: '#009432' },
};

class Flash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { error, warning, success, visible, classes } = this.props;

    return (
      <>
        {visible && (
          <div className={classes.flashContainer}>
            <Card
              classes={{
                root: `${classes.card} ${
                  error
                    ? classes.error
                    : warning
                    ? classes.warning
                    : success
                    ? classes.success
                    : ''
                }`,
              }}>
              <Typography>{error || warning || success}</Typography>
            </Card>
          </div>
        )}
      </>
    );
  }
}

export default withStyles(styles)(Flash);
