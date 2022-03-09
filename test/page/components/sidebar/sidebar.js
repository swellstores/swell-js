import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import {
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@material-ui/core';
import { Payment, ExpandLess, ExpandMore } from '@material-ui/icons';

const styles = {
  listItemIcon: {
    justifyContent: 'center',
  },
  listItemText: {
    paddingRight: 32,
  },
  menuList: {
    paddingLeft: 32,
  },
  listItemLink: {
    textDecoration: 'unset',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuState: {},
    };
  }

  onMenuToggle(itemId) {
    this.setState({
      menuState: {
        ...this.state.menuState,
        [itemId]: !this.state.menuState[itemId],
      },
    });
  }

  getMenuListItem(item, itemIndex) {
    const { menuState } = this.state;
    const { classes, onToggleSidebar } = this.props;

    const itemId = item.text.toLowerCase();
    const isOpen = menuState[itemId];

    return (
      <div key={itemIndex}>
        <ListItem text={item.text} button onClick={() => this.onMenuToggle(itemId)}>
          <ListItemIcon classes={{ root: classes.listItemIcon }}>{item.icon}</ListItemIcon>
          <ListItemText classes={{ root: classes.listItemText }} primary={item.text} />
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding classes={{ root: classes.menuList }}>
            {item.menu.map((menuItem, menuItemIndex) => (
              <Link
                key={menuItemIndex}
                to={`/${item.text.toLowerCase()}/${menuItem.toLowerCase()}`}
                className={classes.listItemLink}
                onClick={onToggleSidebar}
              >
                <ListItem text={menuItem}>
                  <ListItemText secondary={menuItem} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Collapse>
      </div>
    );
  }

  getListItem(item, index) {
    const { classes, onToggleSidebar } = this.props;

    return (
      <Link
        key={index}
        to={`/${item.text.toLowerCase()}`}
        className={classes.listItemLink}
        onClick={onToggleSidebar}
      >
        <ListItem text={item.text}>
          <ListItemIcon classes={{ root: classes.listItemIcon }}>{item.icon}</ListItemIcon>
          <ListItemText classes={{ root: classes.listItemText }} primary={item.text} />
        </ListItem>
      </Link>
    );
  }

  getListItems() {
    return [
      {
        text: 'Payment',
        icon: <Payment />,
        menu: [
          'PayPal',
          'Braintree-PayPal',
          'Stripe',
          'Stripe-iDEAL',
          'Stripe-Klarna',
          'Stripe-Bancontact',
          'Quickpay',
          'Paysafecard',
          'Square',
          'Braintree',
          'Klarna',
        ],
      },
    ].map((item, index) =>
      item.menu ? this.getMenuListItem(item, index) : this.getListItem(item, index),
    );
  }

  render() {
    const { classes, onToggleSidebar, open } = this.props;

    return (
      <SwipeableDrawer open={open} onClose={onToggleSidebar} onOpen={onToggleSidebar}>
        <List>{this.getListItems()}</List>
      </SwipeableDrawer>
    );
  }
}

export default withStyles(styles)(Sidebar);
