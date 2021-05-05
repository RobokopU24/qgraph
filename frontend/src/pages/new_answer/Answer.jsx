import React, { useContext } from 'react';

import trapiUtils from '~/utils/trapi';
import usePageStatus from '~/stores/usePageStatus';
import AlertContext from '~/context/alert';

import useAnswerStore from './useAnswerStore';
import useDisplayState from './useDisplayState';

import LeftDrawer from './LeftDrawer';
import KgBubble from './KgBubble';
import KgFull from './KgFull';
import QueryGraph from './QueryGraph';
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
            answerStore.initialize(msg.message);
            pageStatus.setSuccess();
          } catch (err) {
            console.error(err);
            displayAlert('error', `Failed to initialize message. Please submit an issue: ${err}`);
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
      <div style={{ marginLeft: '200px' }}>
        <pageStatus.Display />
        {pageStatus.displayPage && (
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
        )}
      </div>
    </>
  );
}
