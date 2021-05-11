import React, { useContext } from 'react';

import trapiUtils from '~/utils/trapi';
import usePageStatus from '~/stores/usePageStatus';
import AlertContext from '~/context/alert';
import queryGraphUtils from '~/utils/queryGraph';

import useAnswerStore from './useAnswerStore';
import useDisplayState from './useDisplayState';

import LeftDrawer from './LeftDrawer';
import KgBubble from './kgBubble/KgBubble';
import KgFull from './fullKg/KgFull';
import QueryGraph from './queryGraph/QueryGraph';
import ResultsTable from './resultsTable/ResultsTable';

import './answer.css';

export default function Answer() {
  const answerStore = useAnswerStore();
  const pageStatus = usePageStatus(false);
  const displayAlert = useContext(AlertContext);
  const displayState = useDisplayState();

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
        onUpload={onUpload}
      />
      <div id="answerContentContainer">
        <pageStatus.Display />
        {pageStatus.displayPage && (
          <>
            {Object.keys(answerStore.message).length ? (
              <>
                {displayState.state.qg.show && (
                  <QueryGraph
                    query_graph={answerStore.message.query_graph}
                  />
                )}
                {displayState.state.kg.show && (
                  <KgBubble
                    nodes={answerStore.kgNodes}
                    knowledge_graph={answerStore.message.knowledge_graph}
                    numQgNodes={Object.keys(answerStore.message.query_graph.nodes).length}
                    numResults={answerStore.message.results.length}
                  />
                )}
                {displayState.state.kgFull.show && (
                  <KgFull
                    message={answerStore.message}
                  />
                )}
                {displayState.state.results.show && (
                  <ResultsTable
                    store={answerStore}
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
