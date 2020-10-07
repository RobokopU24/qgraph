import React, { useState, useContext } from 'react';
import {
  Grid, Row, Tabs, Tab,
} from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import UserContext from '@/context/user';

import API from '@/API';

import AnswersetView from '@/components/shared/answersetView/AnswersetView';
import parseMessage from '@/utils/parseMessage';

import './newQuestion.css';
import Loading from '../../components/loading/Loading';
import QuickQuestionError from './subComponents/QuickQuestionError';
import QuestionBuilder from './questionBuilder/QuestionBuilder';

import useMessageStore from '../../stores/useMessageStore';
import useQuestionStore from './useQuestionStore';
import config from '../../config.json';

export default function SimpleQuestion() {
  const user = useContext(UserContext);
  const [fail, setFail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const messageStore = useMessageStore();
  const questionStore = useQuestionStore();

  function onDownloadQuestion() {
    const data = questionStore.getMachineQuestionSpecJson;
    // Transform the data into a json blob and give it a url
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link with that URL and click it.
    const a = document.createElement('a');
    a.download = 'robokopMachineQuestion.json';
    a.href = url;
    a.click();
    a.remove();
  }

  function onDownloadAnswer() {
    const data = messageStore.message;

    // Transform the data into a json blob and give it a url
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link with that URL and click it.
    const a = document.createElement('a');
    a.download = 'answerset.json';
    a.href = url;
    a.click();
    a.remove();
  }

  function onResetQuestion() {
    if (window.confirm('Are you sure you want to reset this question? This action cannot be undone.')) {
      messageStore.setMessage({});
    }
  }

  async function onSubmit() {
    setLoading(true);
    const response = await API.ara.getAnswer(questionStore.query_graph);
    if (response.status === 'error') {
      setFail(true);
      setErrorMessage(response.message);
    }
    const parsedMessage = parseMessage(response);
    messageStore.initializeMessage(parsedMessage);
    setLoading(false);
    setReady(true);
  }

  function resetQuestion() {
    setFail(false);
    setErrorMessage('');
  }

  return (
    <Grid>
      <Row>
        {!loading && !ready && (
          <>
            <h1 className="robokopApp">
              Ask a Quick Question
              <br />
              <small>
                {'This question will not be saved. If you would like to save a question, please '}
                {user ? (
                  <Link to="/q/new">
                    go here.
                  </Link>
                ) : (
                  'sign in.'
                )}
              </small>
            </h1>
            <QuestionBuilder
              questionStore={questionStore}
              download={onDownloadQuestion}
              reset={onResetQuestion}
              submit={onSubmit}
            />
          </>
        )}
        {ready && (
          <>
            <div style={{ position: 'block', paddingBottom: '10px' }}>
              <h1 style={{ display: 'inline' }}>{questionStore.questionName}</h1>
              <span style={{ fontSize: '22px', float: 'right', marginTop: '10px' }} title="Download">
                <FaDownload style={{ cursor: 'pointer' }} onClick={onDownloadAnswer} />
              </span>
            </div>
            <AnswersetView
              user={user}
              concepts={config.concepts}
              messageStore={messageStore}
              omitHeader
            />
          </>
        )}
        {loading && (
          <Loading
            message={<p style={{ textAlign: 'center' }}>Loading Answerset</p>}
          />
        )}
      </Row>
      <QuickQuestionError
        showModal={fail}
        closeModal={resetQuestion}
        errorMessage={errorMessage}
      />
    </Grid>
  );
}
