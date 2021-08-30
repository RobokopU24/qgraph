import React, {
  useState, useContext,
} from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import { useAuth0 } from '@auth0/auth0-react';

import BrandContext from '~/context/brand';

import './header.css';

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);

  const {
    logout, isAuthenticated, loginWithPopup,
  } = useAuth0();
  const brandConfig = useContext(BrandContext);

  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <Link to="/" id="robokopBrand">{brandConfig.title}</Link>
        <Link to="/questions">Question Library</Link>
        <Link to="/answer">Answer Viewer</Link>
        <div className="grow" />
        {brandConfig.brand === 'robokop' && (
          <>
            <Link to="/about">About</Link>
            <Link to="/help">Help</Link>
            <Link to="/guide">Guide</Link>
          </>
        )}
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
