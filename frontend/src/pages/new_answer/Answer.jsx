import React, { useContext } from 'react';

import trapiUtils from '~/utils/trapi';
import usePageStatus from '~/stores/usePageStatus';
import AlertContext from '~/context/alert';
import queryGraphUtils from '~/utils/queryGraph';

import useAnswerStore from './useAnswerStore';
import useDisplayState from './useDisplayState';

import LeftDrawer from './leftDrawer/LeftDrawer';
import KgBubble from './kgBubble/KgBubble';
import KgFull from './fullKg/KgFull';
import QueryGraph from './queryGraph/QueryGraph';
import ResultsTable from './resultsTable/ResultsTable';

import './answer.css';

/**
 * Main Answer Page component
 *
 * Displays
 * - query graph
 * - knowledge graph bubble chart
 * - full knowledge graph
 * - results table
 */
export default function Answer() {
  const answerStore = useAnswerStore();
  const pageStatus = usePageStatus(false);
  const displayAlert = useContext(AlertContext);
  const { displayState, updateDisplayState } = useDisplayState();

  /**
   * Upload a TRAPI message for viewing
   * @param {*} event - html file input event
   */
  function onUpload(event) {
    const { files } = event.target;
    files.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading('Loading Message...');
      fr.onload = (e) => {
        const fileContents = e.target.result;
        let msg = {};
        try {
          msg = JSON.parse(fileContents);
        } catch (err) {
          displayAlert('error', 'Failed to read this message. Are you sure this is valid JSON?');
        }
        const errors = trapiUtils.validateMessage(msg);
        if (!errors.length) {
          try {
            const standardQueryGraph = queryGraphUtils.standardize(msg.message.query_graph);
            msg.message.query_graph = standardQueryGraph;
            try {
              answerStore.initialize(msg.message);
              pageStatus.setSuccess();
            } catch (err) {
              displayAlert('error', `Failed to initialize message. Please submit an issue: ${err}`);
            }
          } catch (err) {
            displayAlert('error', 'Failed to parse this query graph. Please make sure it is TRAPI compliant.');
          }
        } else {
          pageStatus.setFailure(errors.join(', '));
        }
      };
      fr.onerror = () => {
        displayAlert('error', 'Sorry but there was a problem uploading the file. The file may be invalid JSON.');
      };
      fr.readAsText(file);
    });
    // This clears out the input value so you can upload a second time
    event.target.value = '';
  }

  return (
    <>
      <LeftDrawer
        displayState={displayState}
        updateDisplayState={updateDisplayState}
        onUpload={onUpload}
      />
      <div id="answerContentContainer">
        <pageStatus.Display />
        {pageStatus.displayPage && (
          <>
            {Object.keys(answerStore.message).length ? (
              <>
                {displayState.qg.show && (
                  <QueryGraph
                    query_graph={answerStore.message.query_graph}
                  />
                )}
                {displayState.kg.show && (
                  <KgBubble
                    nodes={answerStore.kgNodes}
                    numQgNodes={Object.keys(answerStore.message.query_graph.nodes).length}
                    numResults={answerStore.message.results.length}
                  />
                )}
                {displayState.kgFull.show && (
                  <KgFull
                    message={answerStore.message}
                  />
                )}
                {displayState.results.show && (
                  <ResultsTable
                    answerStore={answerStore}
                  />
                )}
              </>
            ) : (
              <div id="answerPageSplashMessage">
                <h2>Please upload an answer</h2>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
