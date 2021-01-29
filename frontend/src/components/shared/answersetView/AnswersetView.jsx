import React, { useState, useEffect } from 'react';

import {
  Grid, Tabs, Tab,
} from 'react-bootstrap';

import useMessageStore from '@/stores/useMessageStore';
import queryGraphUtils from '@/utils/queryGraph';
import KnowledgeGraph from '../graphs/KnowledgeGraph';
import ResultsTable from './resultsTable/ResultsTable';
import QuestionGraphContainer from '../graphs/QuestionGraphContainer';

export const answerSetTabEnum = {
  // answerList: 1,
  // interactive: 2,
  answerTable: 1,
  aggregate: 2,
};

function bindingTrapiToStoreFormat(oldBinding) {
  const convertedEdgeBindings = [];
  Object.keys(oldBinding.edge_bindings).forEach((qg_id) => {
    const kg_ids = [];
    oldBinding.edge_bindings[qg_id].forEach((kg_id) => {
      kg_ids.push(kg_id.id);
    });
    convertedEdgeBindings.push({
      qg_id,
      kg_id: kg_ids,
    });
  });
  const convertedNodeBindings = [];
  Object.keys(oldBinding.node_bindings).forEach((qg_id) => {
    const kg_ids = [];
    oldBinding.node_bindings[qg_id].forEach((kg_id) => {
      kg_ids.push(kg_id.id);
    });
    convertedNodeBindings.push({
      qg_id,
      kg_id: kg_ids,
    });
  });
  return {
    node_bindings: convertedNodeBindings,
    edge_bindings: convertedEdgeBindings,
  };
}

/*
 * Convert a message of the new Trapi v1.0 format to match
 * the old format used by useMessageStore
*/
function msgTrapiToStoreFormat(oldMessage) {
  const message = _.cloneDeep(oldMessage);
  message.query_graph = queryGraphUtils.convert.internalToReasoner(message.query_graph);
  message.knowledge_graph = queryGraphUtils.convert.internalToReasoner(message.knowledge_graph);
  message.results = message.results.map(bindingTrapiToStoreFormat);
  return message;
}

/**
 * Full Answerset View
 * @param {object} message message to display
 * @param {array} concepts an array of node types
 * @param {string} question name of the question
 * @param {object} style custom styling to apply to answerset view container
 * @param {boolean} omitHeader omit the question header
 * @param {boolean} enableQuestionSelect can the user select this question
 * @param {boolean} enableQuestionEdit can the user update the question name
 * @param {function} callbackQuestionUpdateMeta function to update question meta data
 * @param {function} callbackQuestionSelect function to update to the selected question
 * @param {string} urlQuestion url to this specific question
 * @param {function} callbackAnswersetSelect function to update to the selected answerset
 * @param {string} urlAnswerset url to this specific answerset
 */
export default function AnswersetView(props) {
  const {
    message, concepts, style,
  } = props;

  const messageStore = useMessageStore();

  useEffect(() => {
    Object.values(message.query_graph.nodes).forEach((node) => {
      if (!node.label) {
        node.label = `${node.name || node.id || node.category}`;
      }
    });
    messageStore.initializeMessage(msgTrapiToStoreFormat(message));
  }, [message]);

  const [tabKey, setTabKey] = useState(answerSetTabEnum.answerTable);

  const hasResults = messageStore.message && messageStore.message.results && Array.isArray(messageStore.message.results);
  return (
    <div>
      {hasResults ? (
        <div style={style}>
          <QuestionGraphContainer
            messageStore={messageStore}
            concepts={concepts}
          />
          <Tabs
            activeKey={tabKey}
            onSelect={setTabKey}
            animation
            id="answerset_tabs"
            mountOnEnter
          >
            {/* <Tab
              eventKey={answerSetTabEnum.answerList}
              title="Answers List"
            >
              <AnswersetList
                user={this.props.user} // Needed to parse feedback to know what is yours
                answers={this.props.answers}
                answersetFeedback={this.props.answersetFeedback}
                answerId={this.props.answerId} // Monitored for select by parameter or page load
                concepts={this.props.concepts}

                enableUrlChange={this.props.enableUrlChange}
                enableFeedbackSubmit={this.props.enableFeedbackSubmit}
                enableFeedbackView={this.props.enableFeedbackView}

                callbackAnswerSelected={this.props.callbackAnswerSelected}
                callbackNoAnswerSelected={this.props.callbackNoAnswerSelected}
                callbackFeedbackSubmit={this.props.callbackFeedbackSubmit}
                enabledAnswerLink={this.props.enabledAnswerLink}
                getAnswerUrl={this.props.getAnswerUrl}

                store={this.answersetStore}
              />
            </Tab> */}
            <Tab
              eventKey={answerSetTabEnum.answerTable}
              title="Results Table"
            >
              <ResultsTable
                concepts={concepts}
                // callbackAnswerSelected={this.props.callbackAnswerSelected}
                messageStore={messageStore}
              />
            </Tab>
            <Tab
              eventKey={answerSetTabEnum.aggregate}
              title="Knowledge Graph"
            >
              <KnowledgeGraph
                concepts={concepts}
                messageStore={messageStore}
              />
            </Tab>
          </Tabs>
        </div>
      ) : (
        <Grid>
          <h4>
            Something went wrong. Please try again.
          </h4>
        </Grid>
      )}
    </div>
  );
}
