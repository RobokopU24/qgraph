import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Help from '@/pages/Help';
import Guide from '@/pages/Guide';
import TermsofService from '@/pages/TermsofService';
import SimpleViewer from '@/pages/SimpleViewer';

import Neighborhood from '@/pages/neighborhood/Neighborhood';
import QuestionList from '@/pages/questionList/QuestionList';
import QuestionAnswerViewer from '@/pages/QuestionAnswerViewer';

import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';

import { ThemeProvider } from '@material-ui/core/styles';
import theme from '@/theme';

import UserContext from '@/user';

export default function App() {
  const [user, setUser] = useState(null);
  const isSignedIn = Boolean(user && user.username);
  return (
    <div id="pageContainer">
      <UserContext.Provider value={user}>
        <ThemeProvider theme={theme}>
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
    </div>
  );
}
