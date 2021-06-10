import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { set as idbSet } from 'idb-keyval';

import API from '~/API';
import QueryBuilderContext from '~/context/queryBuilder';
import UserContext from '~/context/user';
import AlertContext from '~/context/alert';
import queryGraphUtils from '~/utils/queryGraph';
import { useVisibility } from '~/utils/cache';
import usePageStatus from '~/stores/usePageStatus';
import useQueryBuilder from './useQueryBuilder';
import GraphEditor from './graphEditor/GraphEditor';
import TextEditor from './textEditor/TextEditor';
import JsonEditor from './jsonEditor/JsonEditor';

import './queryBuilder.css';

/**
 * Query Builder parent component
 *
 * Displays the text, graph, and json editors
 */
export default function QueryBuilder() {
  const queryBuilder = useQueryBuilder();
  const visibility = useVisibility();
  const pageStatus = usePageStatus(false);
  const [showJson, toggleJson] = useState(false);
  const displayAlert = useContext(AlertContext);
  const user = useContext(UserContext);
  const history = useHistory();

  /**
   * Open iframe in new tab and display query graph json
   */
  function newTabJSON() {
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.state.query_graph);
    const win = window.open();
    win.document.write(`
      <iframe src="data:text/json,${encodeURIComponent(JSON.stringify(prunedQueryGraph, null, 2))}"
      frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen>
      </iframe>`);
  }

  /**
   * Submit this query directly to an ARA and then navigate to the answer page
   */
  async function onQuickSubmit() {
    pageStatus.setLoading('Fetching answer, this may take a while');
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.state.query_graph);
    const response = await API.ara.getAnswer({ message: { query_graph: prunedQueryGraph } });

    if (response.status === 'error') {
      const failedToAnswer = 'Please try asking this question later.';
      displayAlert('error', `${response.message}. ${failedToAnswer}`);
      // go back to rendering query builder
      pageStatus.setSuccess();
    } else {
      // stringify to stay consistent with answer page json parsing
      idbSet('quick_message', JSON.stringify(response))
        .then(() => {
          displayAlert('success', 'Your answer is ready!');
          // once message is stored, navigate to answer page to load and display
          history.push('/answer');
        })
        .catch((err) => {
          displayAlert('error', `Failed to locally store this answer. Please try again later. Error: ${err}`);
          pageStatus.setSuccess();
        });
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
      metadata: { name: 'New Question' },
    };
    let response;

    response = await API.cache.createQuestion(defaultQuestion, user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      return;
    }
    const questionId = response.id;

    // Strip labels from nodes
    const prunedQueryGraph = queryGraphUtils.prune(queryBuilder.state.query_graph);

    // Upload question data
    const questionData = JSON.stringify({ message: { query_graph: prunedQueryGraph } }, null, 2);
    response = await API.cache.setQuestionData(questionId, questionData, user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      return;
    }

    pageStatus.setLoading('Fetching answer, this may take a while');

    // Start the process of getting an answer and display to user when done
    response = await fetchAnswer(questionId);

    if (response.status === 'error') {
      const failedToAnswer = 'Please try asking this question later.';
      displayAlert('error', `${response.message}. ${failedToAnswer}`);
      // go back to rendering query builder
      pageStatus.setSuccess();
    } else {
      const alertText = 'Your answer is ready!';
      const { answerId } = response;
      // User has navigated away, display a button to go to the answer
      if (history.location.pathname !== '/question') {
        displayAlert(
          response.status,
          <>
            <h4>{alertText}</h4>
            {answerId && (
              <Button
                onClick={() => history.push(`/answer/${answerId}`)}
                variant="contained"
              >
                View Answer
              </Button>
            )}
          </>,
        );
      } else {
        displayAlert(response.status, alertText);
        // Redirect to answer
        history.push(`/answer/${answerId}`);
      }
    }
  }

  return (
    <>
      <pageStatus.Display />

      {pageStatus.displayPage && (
        <>
          <div id="queryEditorContainer">
            <QueryBuilderContext.Provider value={queryBuilder}>
              <TextEditor
                rows={queryBuilder.textEditorRows}
              />
              <GraphEditor />
              <JsonEditor
                show={showJson}
                close={() => toggleJson(false)}
              />
            </QueryBuilderContext.Provider>
          </div>
          <Button
            onClick={() => toggleJson(true)}
            variant="contained"
          >
            Edit JSON
          </Button>
          <Button
            onClick={newTabJSON}
            variant="contained"
            style={{ marginLeft: '10px' }}
          >
            View JSON
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            style={{ marginLeft: '10px' }}
          >
            Submit
          </Button>
          <Button
            onClick={onQuickSubmit}
            variant="contained"
            style={{ marginLeft: '10px' }}
          >
            Quick Submit
          </Button>
        </>
      )}
    </>
  );
}
