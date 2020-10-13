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
import useMessageStore from '@/stores/useMessageStore';
import usePageStatus from '@/utils/usePageStatus';

import './newQuestion.css';
import QuestionBuilder from './questionBuilder/QuestionBuilder';

import useQuestionStore from './useQuestionStore';
import config from '../../config.json';

export default function SimpleQuestion() {
  const user = useContext(UserContext);
  const messageStore = useMessageStore();
  const questionStore = useQuestionStore();
  const answersetStatus = usePageStatus();

  const [submittedQuestion, toggleSubmittedQuestion] = useState(false);

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

  function queryGraphStringifyIds(query_graph) {
    // Add IDs to query_graph if they don't exist
    query_graph.nodes =
      query_graph.nodes.map((n, i) => ({ ...n, id: `n${i}` }));
    query_graph.edges =
      query_graph.edges.map((e, i) => ({
        ...e,
        id: `e${i}`,
        source_id: `n${e.source_id}`,
        target_id: `n${e.target_id}`,
      }));
  }

  async function onSubmit() {
    toggleSubmittedQuestion(true);
    answersetStatus.setLoading();

    const query_graph = _.cloneDeep(
      questionStore.query_graph,
    );
    queryGraphStringifyIds(query_graph);
    const response = await API.ara.getAnswer(query_graph);
    if (response.status === 'error') {
      answersetStatus.setFailure(response.message);
      return;
    }
    try {
      const parsedMessage = parseMessage(response);
      messageStore.initializeMessage(parsedMessage);
    } catch (err) {
      answersetStatus.setFailure(response.message);
      return;
    }
    answersetStatus.setSuccess();
  }

  function resetQuestion() {
    setFail(false);
    setErrorMessage('');
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
              download={onDownloadQuestion}
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
                  concepts={config.concepts}
                  messageStore={messageStore}
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
