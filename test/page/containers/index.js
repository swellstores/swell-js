import React from 'react';
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
    this.initApi({});
  }

  onToggleSidebar() {
    this.setState({
      openSidebar: !this.state.openSidebar,
    });
  }

  onStoreInit(params) {
    this.initApi(params);
  }

  onUserLogin(params = {}) {
    this.login(params);
  }

  onUserLogout() {
    this.props.logout();
  }

  initApi(params = {}) {
    this.props.initApi(params);
  }

  login(params = {}) {
    this.props.login(params);
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
  initApi: (params) => {
    dispatch(api.init(params));
  },

  login: (params) => {
    dispatch(userActions.login(params));
  },

  logout: () => {
    dispatch(userActions.logout());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
