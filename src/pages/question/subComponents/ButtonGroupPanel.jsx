import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

import { FaPlusSquare, FaPlus } from 'react-icons/fa';

// import { panelTypes } from '../../../stores/newQuestionStore';

/**
 * Button group on Query graph editor
 * @param {Object} panelStore new question panel custom hook
 * @param {function} toggleJsonEditor function to close the advanced json editor
 */
export default function ButtonGroupPanel({ panelStore, toggleJsonEditor }) {
  const numNodes = Object.keys(panelStore.query_graph.nodes)
    .filter((id) => !panelStore.query_graph.nodes[id].deleted).length;
  return (
    <>
      {numNodes > 0 && (
        <div
          style={{
            position: 'absolute', left: '30px', top: '60px', zIndex: 99,
          }}
        >
          <ButtonGroup vertical>
            <Button onClick={() => panelStore.openPanel('node')}>
              <FaPlusSquare style={{ verticalAlign: 'text-top' }} />{' Add Node'}
            </Button>
            <Button
              onClick={() => panelStore.openPanel('edge')}
              disabled={numNodes < 2}
              title={numNodes < 2 ? 'Please create two nodes before connecting them with an edge' : ''}
            >
              <FaPlus style={{ verticalAlign: 'text-top' }} />{' Add Edge'}
            </Button>
          </ButtonGroup>
        </div>
      )}
      <Button
        style={{
          position: 'absolute', left: '10px', bottom: '0px', zIndex: 99,
        }}
        bsSize="xsmall"
        onClick={toggleJsonEditor}
        bsStyle="link"
      >
        <u>Advanced</u>
      </Button>
    </>
  );
}
