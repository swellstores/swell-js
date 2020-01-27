import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Main from './containers';
import Payment from './containers/payment';
import './global.css';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Main />
        <Switch>
          <Route
            path="/payment/:gateway"
            render={(props) => <Payment gateway={props.match.params.gateway} />}
          />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
