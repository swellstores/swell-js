import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import api from '../actions/api';
import Header from '../components/header';
import Sidebar from '../components/sidebar';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openSidebar: false,
      onToggleSidebar: this.onToggleSidebar.bind(this),
    };
  }

  onToggleSidebar() {
    this.setState({
      openSidebar: !this.state.openSidebar,
    });
  }

  componentDidMount() {
    this.props.initApi();
  }

  render() {
    const { onToggleSidebar } = this.state;

    return (
      <>
        <Header onToggleSidebar={onToggleSidebar} {...this.props} />
        <Sidebar {...this.state} />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  initApi: () => {
    dispatch(api.init());
  },
});

export default connect(null, mapDispatchToProps)(Main);
