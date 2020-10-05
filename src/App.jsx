import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Help from '@/pages/Help';
import Guide from '@/pages/Guide';
import TermsofService from '@/pages/TermsofService';
import SimpleViewer from '@/pages/SimpleViewer';

import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

import Neighborhood from '@/pages/neighborhood/Neighborhood';
import QuestionList from '@/pages/questionList/QuestionList';
import QuestionAnswerViewer from '@/pages/questionAnswerViewer/QuestionAnswerViewer';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from '@/theme';

import UserContext from '@/context/user';
import AlertContext from '@/context/alert';

export default function App() {
  const [user, setUser] = useState(null);
  const isSignedIn = Boolean(user && user.username);

  const [alert, setAlert] = useState({});

  function simpleSetAlert(severity, msg) {
    setAlert({ severity, msg });
  }

  return (
    <div id="pageContainer">
      <AlertContext.Provider value={simpleSetAlert}>
        <UserContext.Provider value={user}>
          <ThemeProvider theme={theme}>
            <Snackbar
              open={alert.msg}
              anchorOrigin={
                { vertical: 'top', horizontal: 'center' }
              }
              onClose={() => setAlert({})}
            >
              <Alert
                variant="filled"
                severity={alert.severity}
              >
                {alert.msg}
              </Alert>
            </Snackbar>

            <Header user={user} setUser={setUser} />
            <div id="contentContainer">
              <Switch>
                <Route path="/about">
                  <About />
                </Route>
                <Route path="/help">
                  <Help />
                </Route>
                <Route path="/guide">
                  <Guide isSignedIn={isSignedIn} />
                </Route>
                <Route path="/neighborhood">
                  <Neighborhood />
                </Route>
                <Route path="/questions">
                  <QuestionList />
                </Route>
                <Route path="/question/:question_id">
                  <QuestionAnswerViewer />
                </Route>
                <Route path="/termsofservice">
                  <TermsofService />
                </Route>
                <Route
                  path="/simple"
                  render={({ match: { url } }) => (
                    <>
                      <Route path={`${url}/view`} component={() => SimpleViewer({ user })} exact />
                    </>
                  )}
                />
                <Route path="/">
                  <Landing isSignedIn={isSignedIn} />
                </Route>
              </Switch>
            </div>
            <Footer />
          </ThemeProvider>
        </UserContext.Provider>
      </AlertContext.Provider>
    </div>
  );
}
