import React, {
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Link as MuiLink } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import { useAuth0 } from '@auth0/auth0-react';

import './header.css';
import Logo from '../Logo';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    logout, isAuthenticated, loginWithPopup,
  } = useAuth0();

  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <MuiLink href="https://robokop.renci.org" style={{ cursor: 'pointer', margin: 0 }}><Logo height="48px" width="100%" style={{ paddingTop: '6px' }} /></MuiLink>
        <div className="grow" />
        <Link to="/">Question Builder</Link>
        <Link to="/about">About</Link>
        <Link to="/guide">Guide</Link>
        <Link to="/tutorial">Tutorial</Link>
        <a href="https://robokop.renci.org/#contact" target="_blank" rel="noreferrer">Help</a>
        <Divider orientation="vertical" variant="middle" flexItem />
        <IconButton
          onClick={(e) => (
            isAuthenticated ? setAnchorEl(e.currentTarget) : loginWithPopup()
          )}
          fontSize="large"
          aria-label="signinButton"
        >
          {isAuthenticated ? (
            <AccountCircle id="signedInIcon" fontSize="large" />
          ) : (
            <AccountCircleOutlinedIcon id="signedOutIcon" fontSize="large" />
          )}
        </IconButton>
        <Popover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Button onClick={() => logout({ returnTo: `${window.location.origin}/logout` })}>Sign Out</Button>
        </Popover>
      </Toolbar>
    </AppBar>
  );
}
