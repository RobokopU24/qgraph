import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import {
  FaThList, FaFileCode,
} from 'react-icons/fa';
import { IoIosGitNetwork } from 'react-icons/io';
// import IoCodeWorking from 'react-icons/lib/io/code-working'

import './tableSubComponent.css';

import TableSubGraph from './subGraph/TableSubGraph';
import JsonView from './subJson/JsonView';
import MetaDataView from './subMetaData/MetaDataView';

export const answersetSubComponentEnum = {
  graph: 1,
  json: 2,
  metadata: 3,
};

export default function TableSubComponent(props) {
  const {
    data, messageStore,
  } = props;
  const [nodeId, setNodeId] = useState(null);
  const [rowData, updateRowData] = useState({});
  const [activeSubComponentButton, setActiveSubComponentButton] = useState(answersetSubComponentEnum.graph);

  // Method that updates local mobx state with activeButton and nodeId based on props
  function syncPropsWithState() {
    if (nodeId) {
      setNodeId(nodeId);
    }
    const tempRowData = messageStore.getDenseAnswer(data.id);

    updateRowData(tempRowData);
  }

  useEffect(() => {
    syncPropsWithState();
  }, []);

  const isJsonActive = activeSubComponentButton === answersetSubComponentEnum.json;
  const isGraphActive = activeSubComponentButton === answersetSubComponentEnum.graph;
  const isMetadataActive = activeSubComponentButton === answersetSubComponentEnum.metadata;
  return (
    <div id="tableSubComponentBackground">
      <div id="tableSubComponentContainer">
        <ButtonGroup
          orientation="vertical"
          variant="contained"
          className="tableSubComponentButtons"
        >
          <Button
            className={isJsonActive ? 'activeSubComponentButton' : ''}
            style={{ textAlign: 'left' }}
            onClick={() => setActiveSubComponentButton(answersetSubComponentEnum.json)}
          >
            <span className="valign-center">
              <FaFileCode />
              <span style={{ paddingLeft: '5px' }}>JSON</span>
            </span>
          </Button>
          <Button
            className={isGraphActive ? 'activeSubComponentButton' : ''}
            style={{ textAlign: 'left' }}
            onClick={() => setActiveSubComponentButton(answersetSubComponentEnum.graph)}
          >
            <div className="valign-center">
              <IoIosGitNetwork />
              <span style={{ paddingLeft: '5px' }}>Graph</span>
            </div>
          </Button>
          <Button
            className={isMetadataActive ? 'activeSubComponentButton' : ''}
            style={{ textAlign: 'left' }}
            onClick={() => setActiveSubComponentButton(answersetSubComponentEnum.metadata)}
          >
            <span className="valign-center">
              <FaThList />
              <span style={{ paddingLeft: '5px' }}>Metadata</span>
            </span>
          </Button>
        </ButtonGroup>
        {isJsonActive && (
          <JsonView
            rowData={rowData}
          />
        )}
        <TableSubGraph
          show={isGraphActive}
          messageStore={messageStore}
          activeAnswerId={rowData.id}
        />
        {isMetadataActive && rowData.nodes && (
          <MetaDataView
            messageStore={messageStore}
            rowData={rowData.nodes}
          />
        )}
      </div>
    </div>
  );
}
