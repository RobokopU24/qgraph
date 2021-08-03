import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider, StylesProvider } from '@material-ui/core/styles';

import Landing from '~/pages/Landing';
import About from '~/pages/About';
import Help from '~/pages/Help';
import Guide from '~/pages/Guide';
import TermsofService from '~/pages/TermsofService';
import QueryBuilder from '~/pages/queryBuilder/QueryBuilder';
import Answer from '~/pages/answer/Answer';

import QuestionList from '~/pages/questionList/QuestionList';

import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import AlertWrapper from '~/components/AlertWrapper';

import theme from '~/theme';
import API from '~/API';

import UserContext from '~/context/user';
import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';
import BrandContext from '~/context/brand';

import useBiolinkModel from '~/stores/useBiolinkModel';

import robokop_config from './robokop_config.json';
import qgraph_config from './qgraph_config.json';

export default function App() {
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({});
  const [brandConfig, setBrandConfig] = useState({});
  const biolink = useBiolinkModel();

  function simpleSetAlert(severity, msg) {
    setAlert({ severity, msg });
  }

  // Load biolink on page load
  async function fetchBiolink() {
    const response = await API.biolink.getModelSpecification();
    if (response.status === 'error') {
      simpleSetAlert('error',
        'Failed to contact server to download biolink model. You will not be able to select general nodes or predicates. Please try again later.');
      return;
    }
    biolink.setBiolinkModel(response);
  }
  useEffect(() => {
    fetchBiolink();
    const brand = process.env.BRAND;
    if (brand === 'robokop') {
      setBrandConfig(robokop_config);
      document.title = 'ROBOKOP';
    } else {
      setBrandConfig(qgraph_config);
    }
  }, []);

  return (
    <div id="pageContainer">
      <BrowserRouter>
        <BrandContext.Provider value={brandConfig}>
          <AlertContext.Provider value={simpleSetAlert}>
            <UserContext.Provider value={user}>
              <BiolinkContext.Provider value={biolink}>
                <ThemeProvider theme={theme}>
                  <StylesProvider injectFirst>
                    <AlertWrapper
                      alert={alert}
                      onClose={() => simpleSetAlert(alert.severity, '')}
                    />
                    <Header setUser={setUser} />
                    <div id="contentContainer">
                      <Switch>
                        <Route path="/about">
                          <About />
                        </Route>
                        <Route path="/help">
                          <Help />
                        </Route>
                        <Route path="/guide">
                          <Guide />
                        </Route>
                        <Route path="/questions">
                          <QuestionList />
                        </Route>
                        <Route path="/termsofservice">
                          <TermsofService />
                        </Route>
                        <Route path="/answer/:answer_id?">
                          <Answer />
                        </Route>
                        <Route path={brandConfig.brand === 'robokop' ? '/question' : '/'}>
                          <QueryBuilder />
                        </Route>
                        {brandConfig.brand === 'robokop' && (
                          <Route path="/">
                            <Landing />
                          </Route>
                        )}
                      </Switch>
                    </div>
                    <Footer />
                  </StylesProvider>
                </ThemeProvider>
              </BiolinkContext.Provider>
            </UserContext.Provider>
          </AlertContext.Provider>
        </BrandContext.Provider>
      </BrowserRouter>
    </div>
  );
}
