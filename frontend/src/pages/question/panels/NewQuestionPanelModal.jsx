import React, { useContext, useMemo } from 'react';
import { Modal, ButtonGroup, Button } from 'react-bootstrap';
import { FaSave, FaTrash, FaUndo } from 'react-icons/fa';

import BiolinkContext from '@/context/biolink';
import HelpButton from '@/components/shared/HelpButton';
import getNodeCategoryColorMap from '@/utils/colorUtils';
import EdgePanel from './EdgePanel';
import NodePanel from './NodePanel';
import './panels.css';

/**
 * Modal for creation of a new node or edge
 * @param {Object} panelStore new question panel custom hook
 */
export default function NewQuestionPanelModal({ panelStore, onQuestionUpdated }) {
  const { concepts } = useContext(BiolinkContext);
  /**
   * Get the panel background color
   * @param {Boolean} isNodePanel is panel of category node
   */
  function getBackgroundColor(isNodePanel) {
    // set the color of the node/edge panel header
    const panelColorMap = getNodeCategoryColorMap(concepts);
    if (isNodePanel) {
      return { backgroundColor: panelColorMap(panelStore.node.category) };
    }
    const { nodes } = panelStore.query_graph;
    // only find the node panels in questionStore state.
    const node1 = nodes[panelStore.edge.sourceId];
    const category1 = (node1 && node1.category[0]) || 'edge';
    const node2 = nodes[panelStore.edge.targetId];
    const category2 = (node2 && node2.category[0]) || 'edge';
    const color1 = panelColorMap(category1);
    const color2 = panelColorMap(category2);
    return { backgroundImage: `linear-gradient(80deg, ${color1} 50%, ${color2} 50%)`, borderRadius: '5px 5px 0px 0px' };
  }

  function handleSave() {
    const updatedQueryGraph = panelStore.saveActivePanel();
    onQuestionUpdated(updatedQueryGraph);
  }

  const isNodePanel = panelStore.panelType === 'node';
  const isNewPanel = panelStore.activePanelId == null;
  const backgroundColor = useMemo(() => getBackgroundColor(isNodePanel),
    [panelStore.node.category, panelStore.edge.sourceId, panelStore.edge.targetId, panelStore.showPanel]);
  return (
    <Modal
      style={{ marginTop: '5%' }}
      show={panelStore.showPanel}
      backdrop="static"
      onHide={() => panelStore.togglePanel(false)}
      bsSize="lg"
    >
      <Modal.Header style={backgroundColor} closeButton>
        <Modal.Title style={{ height: '6%', display: 'inline-block' }}>
          {`${isNodePanel ? 'Node' : 'Edge'} ${panelStore.name} `}
          <HelpButton link="nedgePanel" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 300 }}>
        {isNodePanel ? (
          <NodePanel panelStore={panelStore} />
        ) : (
          <EdgePanel panelStore={panelStore} />
        )}
      </Modal.Body>
      <Modal.Footer>
        <ButtonGroup className="pull-right">
          {(Object.keys(panelStore.query_graph.nodes).length > 0) && (
            <Button
              onClick={() => {
                if (!isNewPanel) {
                  if (isNodePanel) {
                    const updatedQueryGraph = panelStore.removeNode();
                    // propogate node removal to query graph
                    onQuestionUpdated(updatedQueryGraph);
                  } else {
                    const updatedQueryGraph = panelStore.removeEdge();
                    // propogate edge removal to query graph
                    onQuestionUpdated(updatedQueryGraph);
                  }
                }
                panelStore.togglePanel(false);
              }}
              title={`${isNewPanel ? 'Discard' : 'Delete'} current ${isNodePanel ? 'node' : 'edge'}`}
            >
              <FaTrash style={{ verticalAlign: 'text-top' }} />{` ${isNewPanel ? 'Discard' : 'Delete'}`}
            </Button>
          )}
          {!isNewPanel && (
            <Button
              onClick={panelStore.revertActivePanel}
              disabled={!panelStore.unsavedChanges}
              title={panelStore.unsavedChanges ? 'Undo unsaved changes' : 'No changes to undo'}
            >
              <FaUndo style={{ verticalAlign: 'text-top' }} />
              {' Undo'}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!(
              panelStore.isValid &&
              (panelStore.unsavedChanges || isNewPanel)
            )}
            bsStyle={panelStore.isValid ? (panelStore.unsavedChanges ? 'primary' : 'default') : 'danger'} // eslint-disable-line no-nested-ternary
            title={panelStore.isValid ? (panelStore.unsavedChanges ? 'Save changes' : 'No changes to save') : 'Fix invalid panel entries first'} // eslint-disable-line no-nested-ternary
          >
            <FaSave style={{ verticalAlign: 'text-top' }} />
            {' Save'}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </Modal>
  );
}
