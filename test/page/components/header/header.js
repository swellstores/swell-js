import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
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
  Tooltip,
} from '@material-ui/core';
import { MenuOpen, Store, Person } from '@material-ui/icons';
import config from '../../config';

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
  storeInfo: {
    display: 'flex',
  },
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeIdRef: React.createRef(),
      publicKeyRef: React.createRef(),
      urlRef: React.createRef(),
      emailKeyRef: React.createRef(),
      passwordKeyRef: React.createRef(),
      openStoreDialog: false,
      onToggleStoreDialog: this.onToggleStoreDialog.bind(this),
      onSubmitStore: this.onSubmitStore.bind(this),
      openUserDialog: false,
      onToggleUserDialog: this.onToggleUserDialog.bind(this),
      onSubmitUser: this.onSubmitUser.bind(this),
    };
  }

  componentDidMount() {
    const { onStoreInit } = this.props;
    if (config.store) {
      onStoreInit({ ...config });
    }
  }

  onToggleStoreDialog() {
    this.setState({
      openStoreDialog: !this.state.openStoreDialog,
    });
  }

  onToggleUserDialog() {
    this.setState({
      openUserDialog: !this.state.openUserDialog,
    });
  }

  onSubmitStore() {
    const { onStoreInit } = this.props;
    const { onToggleStoreDialog, storeIdRef, publicKeyRef, urlRef } = this.state;

    const store = storeIdRef.current.value;
    const key = publicKeyRef.current.value;
    const url = urlRef.current.value;

    onStoreInit({ store, key, url: url || undefined });
    onToggleStoreDialog();
  }

  onSubmitUser() {
    const { onUserLogin } = this.props;
    const { onToggleUserDialog, emailKeyRef, passwordKeyRef } = this.state;

    const email = emailKeyRef.current.value;
    const password = passwordKeyRef.current.value;

    onUserLogin({ email, password });
    onToggleUserDialog();
  }

  renderStoreDialog() {
    const { classes } = this.props;
    const {
      openStoreDialog,
      onToggleStoreDialog,
      onSubmitStore,
      storeIdRef,
      publicKeyRef,
      urlRef,
    } = this.state;

    return (
      <Dialog open={openStoreDialog} onClose={onToggleStoreDialog}>
        <DialogTitle classes={{ root: classes.dialogTitle }}>Init API</DialogTitle>
        <DialogContent>
          <Input
            fullWidth
            type="text"
            placeholder="Store ID"
            inputRef={storeIdRef}
            value={config.store}
          />
          <Input
            fullWidth
            type="text"
            placeholder="Public key"
            inputRef={publicKeyRef}
            value={config.publicKey}
          />
          <Input
            fullWidth
            type="text"
            placeholder="URL (optional)"
            inputRef={urlRef}
            value={config.url}
          />
          <Input
            fullWidth
            type="text"
            placeholder="Vault URL (optional)"
            inputRef={urlRef}
            value={config.vaultUrl}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onToggleStoreDialog} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={onSubmitStore}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderUserDialog() {
    const { classes } = this.props;
    const {
      openUserDialog,
      onToggleUserDialog,
      onSubmitUser,
      emailKeyRef,
      passwordKeyRef,
    } = this.state;

    return (
      <Dialog open={openUserDialog} onClose={onToggleUserDialog}>
        <DialogTitle classes={{ root: classes.dialogTitle }}>Login</DialogTitle>
        <DialogContent>
          <Input fullWidth type="email" placeholder="Email" inputRef={emailKeyRef} />
          <Input fullWidth type="password" placeholder="Password" inputRef={passwordKeyRef} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onToggleUserDialog} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={onSubmitUser}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderStoreControls() {
    const { onToggleStoreDialog } = this.state;
    const { api } = this.props;

    return (
      <Tooltip
        title={api ? `${api.options.store} (${api.options.key})` : 'Init API'}
        placement="left-end"
      >
        <IconButton onClick={onToggleStoreDialog} color={api ? 'primary' : 'secondary'}>
          <Store />
        </IconButton>
      </Tooltip>
    );
  }

  renderUserControls() {
    const { onToggleUserDialog } = this.state;
    const { user } = this.props;

    return (
      <Tooltip title={user ? `${user.name}` : 'Login'} placement="left-end">
        <IconButton onClick={onToggleUserDialog} color={user ? 'primary' : 'secondary'}>
          <Person />
        </IconButton>
      </Tooltip>
    );
  }

  render() {
    const { onToggleSidebar, classes, api } = this.props;

    return (
      <AppBar classes={{ root: classes.appBar }} color="default">
        <IconButton onClick={onToggleSidebar}>
          <MenuOpen />
        </IconButton>
        <div>
          {this.renderStoreControls()}
          {api && this.renderUserControls()}
        </div>
        {this.renderStoreDialog()}
        {this.renderUserDialog()}
      </AppBar>
    );
  }
}

const mapStateToProps = ({ api, user }) => ({
  api,
  user,
});

export default compose(connect(mapStateToProps), withStyles(styles))(Header);
