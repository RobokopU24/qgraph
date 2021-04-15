import React, { useState, useContext } from 'react';

import trapiUtils from '~/utils/trapiUtils';
import usePageStatus from '~/utils/usePageStatus';
import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';

import useAnswerStore from './answerStore';

import LeftDrawer from './LeftDrawer';
import KgBubble from './KgBubble';
import QueryGraph from './QueryGraph';
import ResultsTable from './ResultsTable';

import './answer.css';

export default function Answer() {
  const answerStore = useAnswerStore();
  const [message, setMessage] = useState({});
  const pageStatus = usePageStatus(false);
  const displayAlert = useContext(AlertContext);
  const { concepts } = useContext(BiolinkContext);

  function onUpload(event) {
    const { files } = event.target;
    files.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading('Loading Message...');
      fr.onloadend = () => pageStatus.setSuccess();
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
            answerStore.initialize(msg.message, concepts);
          } catch (err) {
            console.error(err);
            displayAlert('error', `Failed to initialize message. Please submit an issue: ${err}`);
          }
        } else {
          pageStatus.setFailure(errors.join(', '));
        }
        setMessage(msg.message);
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
        onUpload={onUpload}
        uploadDisabled={!pageStatus.displayPage}
      />
      <pageStatus.Display />
      {pageStatus.displayPage && (
        <>
          <QueryGraph
            query_graph={message.query_graph}
          />
          <KgBubble
            nodes={answerStore.kgNodes}
            knowledge_graph={message.knowledge_graph}
          />
          <ResultsTable
            columns={answerStore.tableHeaders}
            data={answerStore.message.results}
          />
        </>
      )}
    </>
  );
}
