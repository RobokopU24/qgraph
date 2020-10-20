import React, {
  useEffect, useState, useContext, useRef,
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

import UserContext from '@/context/user';
import AlertContext from '@/context/alert';

import googleIcon from '../../../public/images/btn_google_light_normal_ios.svg';

import './header.css';

export default function Header({ setUser }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const timeoutId = useRef(null);

  const user = useContext(UserContext);
  const displayAlert = useContext(AlertContext);

  /**
   * Automatically refresh a user token a minute before it expires
   * This will run in the background and ping google every 30 mins or so
   * @param {number} timeToRefresh number of seconds before a token is set to expire
   * @param {object} googleUser google user object
   */
  function refreshToken(timeToRefresh, googleUser) {
    timeoutId.current = setTimeout(async () => {
      try {
        const { id_token, expires_in } = await googleUser.reloadAuthResponse();
        const username = googleUser.getBasicProfile().Ad;
        setUser({ username, id_token });
        const newRefreshTime = (expires_in - 60) * 1000;
        refreshToken(newRefreshTime, googleUser);
      } catch (err) {
        displayAlert('error', 'Lost connection to Google. Please sign in again.');
        setUser(null);
      }
    }, timeToRefresh);
  }

  function signInSuccess(googleUser) {
    const username = googleUser.getBasicProfile().Ad;
    const { id_token, expires_in } = googleUser.getAuthResponse();
    setUser({ username, id_token });
    const timeToRefresh = (expires_in - 60) * 1000;
    refreshToken(timeToRefresh, googleUser);
  }

  function onSignIn() {
    setAnchorEl(null);
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    GoogleAuth.signIn({
      scope: 'profile email',
    })
      .then((googleUser) => {
        signInSuccess(googleUser);
      })
      .catch((err) => {
        console.log('Sign in error:', err.error);
      });
  }

  function signOut() {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    GoogleAuth.signOut()
      .then(() => {
        setUser(null);
        clearTimeout(timeoutId.current);
        // This disconnect closes the scope to the Robokop google credentials
        GoogleAuth.disconnect();
      });
  }

  function openSignIn(e) {
    setAnchorEl(e.currentTarget);
  }

  useEffect(() => {
    if (window.gapi && !user) {
      window.gapi.load('auth2', () => {
        let GoogleAuth = window.gapi.auth2.getAuthInstance();
        if (!GoogleAuth) {
          window.gapi.auth2.init({
            client_id: '297705140796-41v2ra13t7mm8uvu2dp554ov1btt80dg.apps.googleusercontent.com',
          })
            .then(() => {
              GoogleAuth = window.gapi.auth2.getAuthInstance();
              if (GoogleAuth.isSignedIn.get()) {
                signInSuccess(GoogleAuth.currentUser.get());
              }
            })
            .catch((err) => {
              console.log('error', err);
            });
        } else if (GoogleAuth.isSignedIn.get()) {
          onSignIn(GoogleAuth.currentUser.get());
        }
      });
    }
  }, []);

  return (
    <AppBar position="relative" className="header">
      <Toolbar id="headerToolbar">
        <Link to="/" id="robokopBrand">Robokop</Link>
        <Link to="/questions">Question Library</Link>
        {user ? (
          <Link to="/q/new">Ask a Question</Link>
        ) : (
          <Link to="/simple/question">Ask a Quick Question</Link>
        )}
        <div className="grow" />
        <Link to="/about">About</Link>
        <Link to="/help">Help</Link>
        <Link to="/guide">Guide</Link>
        <Divider orientation="vertical" variant="middle" flexItem />
        <IconButton
          onClick={openSignIn}
          fontSize="large"
        >
          {user ? (
            <AccountCircle id="signedInIcon" fontSize="large" />
          ) : (
            <AccountCircleOutlinedIcon fontSize="large" />
          )}
        </IconButton>
        <Popover
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {user ? (
            <Button onClick={signOut}>Sign Out</Button>
          ) : (
            <Button onClick={onSignIn} id="googleSignIn">
              <img src={googleIcon} alt="google icon" />
              <span>Sign in with Google</span>
            </Button>
          )}
        </Popover>
      </Toolbar>
    </AppBar>
  );
}
