import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import api from '../actions/api';
import userActions from '../actions/user';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import Flash from '../components/flash';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSidebar: false,
      onToggleSidebar: this.onToggleSidebar.bind(this),
      onStoreInit: this.onStoreInit.bind(this),
      onUserLogin: this.onUserLogin.bind(this),
      onUserLogout: this.onUserLogout.bind(this),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.api && !isEqual(this.props.api, nextProps.api)) {
      this.login();
    }
  }

  componentDidMount() {
    this.initApi();
  }

  onToggleSidebar() {
    this.setState({
      openSidebar: !this.state.openSidebar,
    });
  }

  onStoreInit(store, key) {
    this.initApi(store, key);
  }

  onUserLogin(email, password) {
    this.login(email, password);
  }

  onUserLogout() {
    this.props.logout();
  }

  initApi(store, key) {
    this.props.initApi(store, key);
  }

  login(email, password) {
    this.props.login(email, password);
  }

  render() {
    const { onToggleSidebar, openSidebar, onStoreInit, onUserLogin, onUserLogout } = this.state;
    const { flash } = this.props;

    return (
      <>
        <Header
          onToggleSidebar={onToggleSidebar}
          onStoreInit={onStoreInit}
          onUserLogin={onUserLogin}
          onUserLogout={onUserLogout}
        />
        <Sidebar onToggleSidebar={onToggleSidebar} open={openSidebar} />
        <Flash {...flash} />
      </>
    );
  }
}

const mapStateToProps = ({ api, flash }) => ({
  api,
  flash,
});

const mapDispatchToProps = (dispatch) => ({
  initApi: (store, key) => {
    dispatch(api.init(store, key));
  },

  login: (email, password) => {
    dispatch(userActions.login(email, password));
  },

  logout: () => {
    dispatch(userActions.logout());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
