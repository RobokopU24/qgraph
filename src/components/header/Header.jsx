import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import {
  Link as MuiLink,
} from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { AccountCircle } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';

import { useAuth } from '~/context/AuthContext';
import LoginDialog from '../LoginDialog';

import './header.css';
import Logo from '../Logo';

export default function Header() {
  const history = useHistory();

  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    setLoginDialogOpen(true);
    handleMenuClose();
  };

  const handleProfileClick = () => {
    history.push('/profile');
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <MuiLink href="/" style={{ cursor: 'pointer', margin: 0 }}><Logo height="48px" width="100%" style={{ paddingTop: '6px' }} /></MuiLink>
        <div className="grow" />
        <Link to="/">Question Builder</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/about">About</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/tutorial">Tutorial</Link>
        {/* This will go to the actual root of the host (robokop.renci.org/#contact), not an internal route in this application */}
        <a href="/#contact">Help</a>
        <div>
          <IconButton
            onClick={handleMenuOpen}
          >
            {user ? (
              <Avatar src={user.profilePicture} sizes="small">
                {user.name ? user.name.charAt(0).toUpperCase() : ''}
              </Avatar>
            ) : <AccountCircle style={{ fontSize: '32px' }} />}
          </IconButton>
          <Menu
            style={{ marginTop: '48px' }}
            id="account-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {user ? (
              [
                <MenuItem onClick={handleProfileClick} key="profile">Profile</MenuItem>,
                <MenuItem onClick={handleLogout} key="logout">Logout</MenuItem>,
              ]
            ) : (
              <MenuItem onClick={handleLoginClick}>Login</MenuItem>
            )}
          </Menu>
        </div>
      </Toolbar>
      <LoginDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
      />
    </AppBar>
  );
}
