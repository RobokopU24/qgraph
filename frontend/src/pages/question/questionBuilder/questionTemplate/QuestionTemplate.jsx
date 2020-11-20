import React, {
  useState, useEffect,
} from 'react';
import {
  Modal, DropdownButton, MenuItem, Button,
} from 'react-bootstrap';
import shortid from 'shortid';
import _ from 'lodash';

import questionTemplates from '@/questionTemplates';

import FillIdentifier from './subComponents/FillIdentifier';

function extractDetails(questionTemplate) {
  const newTypes = [];
  const newLabels = [];
  const newCuries = [];
  questionTemplate.query_graph.nodes.forEach((node) => {
    if (node.curie) {
      // we're going to grab the number of the identifier from the curie and add that node's type to the list of types in its correct spot.
      if (Array.isArray(node.curie)) {
        node.curie.forEach((curie) => {
          // find the indentifier's number
          const i = curie.match(/\d/);
          // minus one because index starts at 0
          newTypes[i - 1] = node.type;
        });
      } else {
        const i = node.curie.match(/\d/);
        newTypes[i - 1] = node.type;
      }
      newLabels.push('');
      newCuries.push('');
    }
  });
  return { newTypes, newLabels, newCuries };
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
  const [nameList, updateNameList] = useState([]);
  const [types, setTypes] = useState([]);
  const [labels, setLabels] = useState([]);
  const [curies, setCuries] = useState([]);

  // We use the name.focus property as a signal that the
  // underlying component needs to execute the focus method.
  //
  // After it is set to true, the component will clear it
  // once the focus operation is done
  function setFocus(i, value) {
    updateNameList((oldNameList) => {
      const newNameList = [...oldNameList];
      newNameList[i].focus = value;
      return newNameList;
    });
  }

  function replaceName(qName, newTypes) {
    const newNameList = [];
    let question = qName;
    question = question.split(/\s|\?/g);
    let num = 1;
    for (let i = 0; i < question.length; i += 1) {
      const nameRegex = `$name${num}$`;
      const idRegex = `($identifier${num}$)`;
      if (question[i] === nameRegex) {
        const refNum = num - 1;
        question[i] = (
          <button
            type="button"
            style={{
              textDecoration: 'underline', color: 'grey', border: 'none', backgroundColor: 'white',
            }}
            onClick={() => setFocus(refNum, true)}
            key={shortid.generate()}
          >
            {newTypes[refNum]}
          </button>
        );
        newNameList.push({
          nameIndex: i, name: '', id: '', ider: refNum, ref: { current: null },
        });
        for (let j = i; j < question.length; j += 1) {
          if (question[j] === idRegex) {
            question.splice(j, 1);
          }
        }
        num += 1;
      }
    }
    updateNameList(newNameList);
    return question;
  }

  function selectNewQuestionTemplate(event) {
    const newQuestionTemplate = _.cloneDeep(event);
    let newQuestionName = newQuestionTemplate.natural_question;
    const { newTypes, newLabels, newCuries } = extractDetails(newQuestionTemplate);
    newQuestionName = replaceName(newQuestionName, newTypes);
    setQuestionTemplate(newQuestionTemplate);
    updateQuestionName(newQuestionName);
    setTypes(newTypes);
    setCuries(newCuries);
    setLabels(newLabels);
  }

  function updateQuestionTemplate() {
    if (!questionTemplate || !questionTemplate.query_graph) return;

    const newQuestionTemplate = { ...questionTemplate };
    newQuestionTemplate.natural_question = questionName.join(' ');
    let num = 0;
    newQuestionTemplate.query_graph.nodes.forEach((node, index) => {
      if (node.curie) {
        if (Array.isArray(node.curie)) {
          node.curie.forEach((curie, i) => {
            // TODO: num only works if there's only one curie in the array. So far, that's the only case.
            newQuestionTemplate.query_graph.nodes[index].curie[i] = nameList[num].id;
            newQuestionTemplate.query_graph.nodes[index].name = nameList[num].name;
            num += 1;
          });
        } else {
          newQuestionTemplate.query_graph.nodes[index].curie = nameList[0].id;
          newQuestionTemplate.query_graph.nodes[index].name = nameList[0].name;
        }
      }
    });
    setQuestionTemplate(newQuestionTemplate);
  }

  function handleIdentifierChange(index, value) {
    const { curie, name: label } = value;

    // Values that we update during this function
    const newQuestionName = [...questionName];
    const newNameList = [...nameList];
    const newLabels = [...labels];
    const newCuries = [...curies];

    nameList.forEach((name, i) => {
      if (name.ider === index && label && curie) {
        newQuestionName[name.nameIndex] = `${label} (${curie})`;
        newNameList[i].name = label;
        newNameList[i].id = curie;
        newLabels[index] = label;
        newCuries[index] = curie;
      } else if (name.ider === index && !label && !curie) {
        // we delete whatever was there before. Disable the submit button.
        newQuestionName[name.nameIndex] = (
          <button
            type="button"
            style={{
              textDecoration: 'underline', color: 'grey', border: 'none', backgroundColor: 'white',
            }}
            onClick={() => setFocus(i, true)}
            key={shortid.generate()}
          >
            {types[name.ider]}
          </button>
        );
        newLabels[name.ider] = '';
        newCuries[name.ider] = '';
      }

      updateQuestionName(newQuestionName);
      updateNameList(newNameList);
      setLabels(newLabels);
      setCuries(newCuries);
    });
  }

  function submitTemplate() {
    selectQuestion(questionTemplate);
    setQuestionTemplate({});
    updateQuestionName([]);
    updateNameList([]);
    setTypes([]);
    setLabels([]);
    setCuries([]);
  }

  // Disable if there are still questionName pieces that are not
  // filled in
  const disable = !questionName.every((n) => _.isString(n));

  // Update question template if questionName or nameList changes
  useEffect(updateQuestionTemplate, [questionName, nameList]);

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
        {nameList.map((n, i) => (
          <FillIdentifier
            key={types[i] + i}
            onSelect={(v) => handleIdentifierChange(i, v)}
            focus={n.focus}
            clearFocus={() => setFocus(i, false)}
            type={types[i]}
          />
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button id="questionTempButton" onClick={submitTemplate} disabled={disable}>Load Question</Button>
      </Modal.Footer>
    </Modal>
  );
}
