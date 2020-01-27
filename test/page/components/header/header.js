import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import api from '../../actions/api';
import { withStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Button,
  IconButton,
  Input,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { MenuOpen, Store } from '@material-ui/icons';

const styles = {
  appBar: {
    position: 'unset',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogTitle: {
    textAlign: 'center',
    padding: '16px 24px 0 24px',
  },
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false,
      storeIdRef: React.createRef(),
      publicKeyRef: React.createRef(),
      onToggleDialog: this.onToggleDialog.bind(this),
      onSubmit: this.onSubmit.bind(this),
    };
  }

  onToggleDialog() {
    this.setState({
      openDialog: !this.state.openDialog,
    });
  }

  onSubmit() {
    const { initApi } = this.props;
    const { onToggleDialog, storeIdRef, publicKeyRef } = this.state;

    const store = storeIdRef.current.value;
    const key = publicKeyRef.current.value;

    initApi(store, key);
    onToggleDialog();
  }

  renderCredentialsDialog() {
    const { classes } = this.props;
    const { openDialog, onToggleDialog, onSubmit, storeIdRef, publicKeyRef } = this.state;

    return (
      <Dialog open={openDialog} onClose={onToggleDialog}>
        <DialogTitle classes={{ root: classes.dialogTitle }}>Init API</DialogTitle>
        <DialogContent>
          <Input fullWidth placeholder="Store ID" inputRef={storeIdRef} />
          <Input fullWidth placeholder="Public key" inputRef={publicKeyRef} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onToggleDialog} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={onSubmit}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderStoreControls() {
    const { options: { store, key } = {} } = this.props.api || {};
    const { onToggleDialog } = this.state;

    return (
      <>
        {store && key && (
          <Typography>
            {store} ({key})
          </Typography>
        )}
        <IconButton onClick={onToggleDialog}>
          <Store />
        </IconButton>
      </>
    );
  }

  render() {
    const { onToggleSidebar, classes } = this.props;

    return (
      <AppBar classes={{ root: classes.appBar }} color="default">
        <IconButton onClick={onToggleSidebar}>
          <MenuOpen />
        </IconButton>
        {this.renderStoreControls()}
        {this.renderCredentialsDialog()}
      </AppBar>
    );
  }
}

const mapStateToProps = ({ api }) => ({
  api,
});

const mapDispatchToProps = (dispatch) => ({
  initApi: (store, key) => {
    dispatch(api.init(store, key));
  },
});

export default compose(connect(mapStateToProps, mapDispatchToProps), withStyles(styles))(Header);
