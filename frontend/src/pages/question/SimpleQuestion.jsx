import React, { useState, useContext } from 'react';
import {
  Grid, Row,
} from 'react-bootstrap';

import { FaDownload } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import UserContext from '@/context/user';

import API from '@/API';

import AnswersetView from '@/components/shared/answersetView/AnswersetView';
import usePageStatus from '@/utils/usePageStatus';
import trapiUtils from '@/utils/trapiUtils';

import './newQuestion.css';
import QuestionBuilder from './questionBuilder/QuestionBuilder';

import useQuestionStore from './useQuestionStore';

export default function SimpleQuestion() {
  const user = useContext(UserContext);
  const [message, setMessage] = useState(null);
  const questionStore = useQuestionStore();
  const answersetStatus = usePageStatus();

  const [submittedQuestion, toggleSubmittedQuestion] = useState(false);

  function onDownloadAnswer() {
    // Transform the message into a json blob and give it a url
    const json = JSON.stringify(message);
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
      const emptyGraph = { nodes: [], edges: [] };
      setMessage({
        query_graph: emptyGraph,
        knowledge_graph: emptyGraph,
        results: [],
      });
      questionStore.resetQuestion();
    }
  }

  async function onSubmit() {
    toggleSubmittedQuestion(true);
    answersetStatus.setLoading();

    const response = await API.ara.getAnswer({ message: { query_graph: questionStore.query_graph } });
    if (response.status === 'error') {
      answersetStatus.setFailure(response.message);
      return;
    }

    const validationErrors = trapiUtils.validateMessage(response);
    if (validationErrors.length) {
      answersetStatus.setFailure(
        `Found errors while parsing message: ${validationErrors.join(', ')}`,
      );
      return;
    }

    setMessage(response.message);
    answersetStatus.setSuccess();
  }

  return (
    <Grid>
      <Row>
        {!submittedQuestion ? (
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
              reset={onResetQuestion}
              submit={onSubmit}
            />
          </>
        ) : (
          <>
            <answersetStatus.Display />
            { answersetStatus.displayPage && (
              <>
                <div style={{ position: 'block', paddingBottom: '10px' }}>
                  <h1 style={{ display: 'inline' }}>{questionStore.questionName}</h1>
                  <span style={{ fontSize: '22px', float: 'right', marginTop: '10px' }} title="Download">
                    <FaDownload style={{ cursor: 'pointer' }} onClick={onDownloadAnswer} />
                  </span>
                </div>
                <AnswersetView
                  user={user}
                  message={message}
                  omitHeader
                />
              </>
            )}
          </>
        )}
      </Row>
    </Grid>
  );
}
