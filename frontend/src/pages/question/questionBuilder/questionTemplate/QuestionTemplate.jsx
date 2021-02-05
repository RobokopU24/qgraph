import React, {
  useState, useEffect,
} from 'react';
import {
  Modal, DropdownButton, MenuItem, Button,
} from 'react-bootstrap';
import shortid from 'shortid';
import _ from 'lodash';

import strings from '@/utils/stringUtils';
import questionTemplates from '@/questionTemplates';

import FillIdentifier from './subComponents/FillIdentifier';

function extractDetails(questionTemplate) {
  const blankNodes = {};
  Object.keys(questionTemplate.query_graph.nodes).forEach((nodeId) => {
    const node = questionTemplate.query_graph.nodes[nodeId];
    if (node.id) {
      // grab the number of the identifier from the id and add that node's category to the list of categories in its correct spot.
      if (Array.isArray(node.id)) {
        node.id.forEach((id) => {
          // find the identifier's number
          const i = id.match(/\d/);
          blankNodes[i] = {
            key: nodeId,
            category: node.category,
            name: '',
            id: '',
          };
        });
      } else {
        const i = node.id.match(/\d/);
        blankNodes[i] = {
          key: nodeId,
          category: node.category,
          name: '',
          id: '',
        };
      }
    }
  });
  return blankNodes;
}

function displayQuestion(questionName) {
  if (questionName.length > 0) {
    // here we just add a space in between each word.
    for (let i = 0; i < questionName.length; i += 2) {
      questionName.splice(i, 0, ' ');
    }
  }
  return questionName;
}

export default function QuestionTemplateModal(props) {
  const {
    selectQuestion, showModal, close,
  } = props;
  const [questionTemplate, setQuestionTemplate] = useState({});
  const [questionName, updateQuestionName] = useState([]);
  const [nodes, updateNodes] = useState({});

  function replaceName(qName, blankNodes) {
    let question = qName;
    question = question.split(/\s|\?/g);
    let num = 1;
    for (let i = 0; i < question.length; i += 1) {
      const nameRegex = `$name${num}$`;
      const idRegex = `($identifier${num}$)`;
      if (question[i] === nameRegex) {
        question[i] = (
          <span style={{ color: 'grey' }} key={i}>
            {strings.displayCategory(blankNodes[num].category).toLowerCase()}
          </span>
        );
        blankNodes[num].questionIndex = i;
        for (let j = i; j < question.length; j += 1) {
          if (question[j] === idRegex) {
            question.splice(j, 1);
          }
        }
        num += 1;
      }
    }
    updateNodes(blankNodes);
    return question;
  }

  function selectNewQuestionTemplate(event) {
    const newQuestionTemplate = _.cloneDeep(event);
    let newQuestionName = newQuestionTemplate.natural_question;
    const blankNodes = extractDetails(newQuestionTemplate);
    newQuestionName = replaceName(newQuestionName, blankNodes);
    setQuestionTemplate(newQuestionTemplate);
    updateQuestionName(newQuestionName);
  }

  function updateQuestionTemplate() {
    if (!questionTemplate || !questionTemplate.query_graph) return;

    const newQuestionTemplate = _.cloneDeep(questionTemplate);
    newQuestionTemplate.natural_question = questionName.join(' ');
    Object.values(nodes).forEach((node) => {
      newQuestionTemplate.query_graph.nodes[node.key].name = node.name;
      newQuestionTemplate.query_graph.nodes[node.key].id = node.id;
    });
    setQuestionTemplate(newQuestionTemplate);
  }

  function handleIdentifierChange(identifierId, value) {
    const { name } = value;
    const id = value.id && value.id[0];

    // Values that we update during this function
    const newQuestionName = [...questionName];
    const blankNodes = _.cloneDeep(nodes);

    if (name && id) {
      blankNodes[identifierId].name = name;
      blankNodes[identifierId].id = id;
      newQuestionName[blankNodes[identifierId].questionIndex] = `${name} (${id})`;
    } else {
      // we delete whatever was there before.
      newQuestionName[blankNodes[identifierId].questionIndex] = (
        <span style={{ color: 'grey' }} key={blankNodes[identifierId].questionIndex}>
          {strings.displayCategory(blankNodes[identifierId].category).toLowerCase()}
        </span>
      );
      blankNodes[identifierId].name = '';
      blankNodes[identifierId].id = '';
    }

    updateQuestionName(newQuestionName);
    updateNodes(blankNodes);
  }

  function submitTemplate() {
    selectQuestion(questionTemplate);
    setQuestionTemplate({});
    updateQuestionName([]);
    updateNodes({});
  }

  // Disable if there are still questionName pieces that are not
  // filled in
  const disable = !questionName.every((n) => _.isString(n));

  // Update question template if questionName or nodes change
  useEffect(updateQuestionTemplate, [questionName, nodes]);

  return (
    <Modal
      style={{ marginTop: '5%' }}
      show={showModal}
      backdrop
      onHide={close}
    >
      <Modal.Header closeButton>
        <Modal.Title>Question Templates</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ minHeight: 200 }}>
        <div className="questionTemplateDropdown" id={questionName.length > 0 ? '' : 'centeredQuestionTemplateMenu'}>
          <DropdownButton
            bsStyle="default"
            title={questionName.length > 0 ? 'Change templates' : 'Select a question template'}
            key={1}
            id="questionTemplateDropdown"
          >
            {questionTemplates.map((question) => (
              <MenuItem
                key={shortid.generate()}
                eventKey={question}
                onSelect={selectNewQuestionTemplate}
              >
                {question.natural_question}
              </MenuItem>
            ))}
          </DropdownButton>
        </div>
        {questionName.length > 0 && (
          <div>
            <h4
              style={{
                display: 'block', width: '100%', margin: '20px 0px', height: '45px', fontSize: '20px', textAlign: 'center', cursor: 'default',
              }}
            >
              {displayQuestion(_.cloneDeep(questionName))}
            </h4>
            <p>Choose curies below to fill out the template.</p>
          </div>
        )}
        {Object.entries(nodes).map(([identifierId, node]) => (
          <FillIdentifier
            key={node.key}
            onSelect={(v) => handleIdentifierChange(identifierId, v)}
            category={node.category}
          />
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button id="questionTempButton" onClick={submitTemplate} disabled={disable}>Load Question</Button>
      </Modal.Footer>
    </Modal>
  );
}
