import React, { useContext } from 'react';
import {
  Grid, Row,
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import _ from 'lodash';

import UserContext from '@/context/user';
import AlertContext from '@/context/alert';

import API from '@/API';

import './newQuestion.css';

import { useVisibility } from '@/utils/cache';
import usePageStatus from '@/utils/usePageStatus';

import QuestionBuilder from './questionBuilder/QuestionBuilder';

import useQuestionStore from './useQuestionStore';

export default function QuestionNew() {
  const history = useHistory();
  const visibility = useVisibility();
  const user = useContext(UserContext);
  const questionStore = useQuestionStore();
  const displayAlert = useContext(AlertContext);

  const pageStatus = usePageStatus(false);

  function onResetQuestion() {
    if (window.confirm('Are you sure you want to reset this question? This action cannot be undone.')) {
      questionStore.resetQuestion();
    }
  }

  async function fetchAnswer(questionId) {
    let response = await API.queryDispatcher.getAnswer(questionId, user.id_token);
    if (response.status === 'error') {
      return response;
    }
    const answerId = response.id;

    response = await API.cache.getQuestion(questionId, user.id_token);
    if (response.status === 'error') {
      return response;
    }

    // Set hasAnswers in metadata to true
    const questionMeta = response;
    questionMeta.metadata.hasAnswers = true;
    response = await API.cache.updateQuestion(questionMeta, user.id_token);
    if (response.status === 'error') {
      return response;
    }

    return { status: 'success', answerId };
  }

  async function onSubmit() {
    const defaultQuestion = {
      parent: '',
      visibility: visibility.toInt('Private'),
      metadata: { name: questionStore.question_name || 'New Question' },
    };
    let response;

    response = await API.cache.createQuestion(defaultQuestion, user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      return;
    }
    const questionId = response.id;

    // Strip labels from nodes
    const prepared_query_graph = _.cloneDeep(questionStore.query_graph);
    Object.values(prepared_query_graph.nodes).forEach((n) => delete n.label);

    // Upload question data
    const questionData = JSON.stringify({ message: { query_graph: prepared_query_graph } }, null, 2);
    response = await API.cache.setQuestionData(questionId, questionData, user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      return;
    }

    pageStatus.setLoading('Fetching answer, this may take a while');

    // Start the process of getting an answer and display to user when done
    response = await fetchAnswer(questionId);

    let alertText;
    if (response.status === 'error') {
      const failedToAnswer = 'Please try fetching a new answer later.';
      alertText = `${response.message}. ${failedToAnswer}`;
    } else {
      alertText = 'Your answer is ready!';
    }

    // User has navigated away, display a button to go to the question
    if (history.location.pathname !== '/q/new') {
      displayAlert(
        response.status,
        <>
          <h4>{alertText}</h4>
          <Button
            onClick={() => history.push(`/question/${questionId}`)}
            variant="contained"
          >
            View {response.status === 'error' ? 'Question' : 'Answer'}
          </Button>
        </>,
      );
    } else {
      displayAlert(response.status, alertText);
      // Redirect to created question
      history.push(`/question/${questionId}`);
    }
  }

  return (
    <>
      <pageStatus.Display />

      { pageStatus.displayPage && (
        <Grid>
          <Row>
            <h1 className="robokopApp">
              Ask a Question
              <br />
            </h1>
            <QuestionBuilder
              questionStore={questionStore}
              reset={onResetQuestion}
              submit={onSubmit}
            />
          </Row>
        </Grid>
      )}
    </>
  );
}
