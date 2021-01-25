import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import Dropzone from 'react-dropzone';
import { FaUpload, FaFolder } from 'react-icons/fa';
import { GoRepoForked } from 'react-icons/go';
import {
  Col, Form, FormGroup, FormControl, Panel, Jumbotron, Button,
} from 'react-bootstrap';
import _ from 'lodash';
import slugify from 'slugify';

import API from '@/API';

import queryGraphUtils from '@/utils/queryGraph';
import { formatDateTimeShort } from '@/utils/cache';
import HelpButton from '@/components/shared/HelpButton';

import AlertContext from '@/context/alert';
import UserContext from '@/context/user';
import NewQuestionButtons from './NewQuestionButtons';
import QuestionGraphViewContainer from './QuestionGraphViewContainer';
import QuestionTemplateModal from './questionTemplate/QuestionTemplate';
import QuestionListModal from './QuestionListModal';

/**
 * Main Question Builder component
 * @param {object} questionStore new question custom hook
 * @param {function} download function to download the current question spec
 * @param {function} reset function to reset the message store custom hook
 * @param {function} submit function to ask the current question
 * @param {string} width width of the question graph viewer
 */
export default function QuestionBuilder(props) {
  const {
    questionStore, reset, submit, width,
  } = props;
  const [showModal, toggleModal] = useState(false);
  const [step, setStep] = useState('options');

  const [forkQuestions, updateForkQuestions] = useState([]);

  const [questionsReady, setQuestionsReady] = useState(false);
  // used just for focus
  const questionName = useRef(null);

  const user = useContext(UserContext);
  const displayAlert = useContext(AlertContext);

  useEffect(() => {
    if (questionStore.question_name) {
      setStep('build');
    }
  }, []);

  function selectOption(option) {
    if (option === 'blank') {
      setStep('questionName');
    } else if (option === 'template') {
      toggleModal(true);
    }
  }

  useEffect(() => {
    if (step === 'questionName') {
      questionName.current.focus();
    }
  }, [step]);

  /**
   * Load the selected question template
   * @param {object} question json object of format
   * @param {string} question.question_name name of the question
   * @param {Object} question.query_graph consisting of nodes and edges
   * @param {Array} question.query_graph.nodes an array of nodes
   * @param {Array} question.query_graph.edges an array of edges
   * @param {Number} question.max_connectivity max connections for question
   */
  function onQuestionTemplate(question) {
    Object.values(question.query_graph.edges).forEach(queryGraphUtils.standardizeType);
    Object.values(question.query_graph.nodes).forEach(queryGraphUtils.standardizeType);
    questionStore.updateQueryGraph(question.query_graph);
    questionStore.updateQuestionName(question.natural_question);
    setStep('build');
    toggleModal(false);
  }

  function validateAndParseFile(fileContents) {
    let fileContentObj;
    try {
      fileContentObj = JSON.parse(fileContents);
    } catch (err) {
      displayAlert('error',
        'The provided file is not valid JSON. Please fix and try again.');
      setStep('options');
      return;
    }

    if (!('query_graph' in fileContentObj)) {
      displayAlert('error',
        'The provided file does not have a query_graph object. Please ensure that the file format adheres to the Reasoner Standard API Query Schema.');
      setStep('options');
      return;
    }

    if (!_.isArray(fileContentObj.query_graph.nodes) ||
       !_.isArray(fileContentObj.query_graph.edges)) {
      displayAlert('error',
        'The provided file does not have an array of nodes or edges. Please ensure that the file format adheres to the Reasoner Standard API Query Schema.');
      setStep('options');
      return;
    }

    // TODO: this is pretty hacky
    fileContentObj.query_graph.nodes.forEach((node) => {
      if (!node.label) {
        node.label = `${node.id}: ${node.name || node.curie || node.category}`;
      }
      queryGraphUtils.standardizeType(node);
    });

    fileContentObj.query_graph.edges.forEach(queryGraphUtils.standardizeType);

    questionStore.updateQueryGraph(
      queryGraphUtils.convert.reasonerToInternal(fileContentObj.query_graph),
    );
    setStep('build');
  }

  function onDropFile(acceptedFiles, rejectedFiles) { // eslint-disable-line no-unused-vars
    acceptedFiles.forEach((file) => {
      const fr = new window.FileReader();
      // fr.onloadend = () => this.setState({ graphState: graphStates.fetching });
      fr.onload = (e) => validateAndParseFile(e.target.result);
      fr.onerror = () => {
        displayAlert('error', 'Sorry but there was a problem uploading the file. Please try again.');
        setStep('options');
      };
      fr.readAsText(file);
    });
  }

  async function getQuestions() {
    const response = await API.cache.getQuestions(user && user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      return;
    }

    updateForkQuestions(response.map((q) => ({
      ...q,
      displayText: `${q.metadata.name} - ${formatDateTimeShort(q.created_at)}`,
    })));
    setQuestionsReady(true);
  }

  /**
   * Load the forked question from robokache
   */
  async function onQuestionFork(qid, name) {
    // Get question from db
    const response = await API.cache.getQuestionData(qid, user && user.id_token);
    if (response.status === 'error') {
      displayAlert('error', response.message);
      setStep('options');
    }
    const { query_graph } = JSON.parse(response);

    questionStore.updateQueryGraph(
      queryGraphUtils.convert.reasonerToInternal(query_graph),
    );
    questionStore.updateQuestionName(name);

    setStep('build');
    // Close panel
    setQuestionsReady(false);
  }

  function resetSteps() {
    reset();
    setStep('options');
  }

  function onDownloadQuestion() {
    const query_graph = queryGraphUtils.convert.internalToReasoner(
      questionStore.query_graph,
    );
    const data = { query_graph };

    // Transform the data into a json blob and give it a url
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const question_name = questionStore.question_name || 'Robokop Question';
    const question_name_slug = slugify(question_name.toLowerCase(), '_', { strict: true });

    // Create a link with that URL and click it.
    const a = document.createElement('a');
    a.download = `${question_name_slug}.json`;
    a.href = url;
    a.click();
    a.remove();
  }

  return (
    <div id="questionBuilder">
      {step === 'options' && (
        <Jumbotron id="newQuestionOptions">
          <Button
            className="optionsButton"
            onClick={() => selectOption('blank')}
          >
            <h3>Blank</h3>
            <p className="optionButtonDesc">Start building a question from the beginning.</p>
          </Button>
          <Button
            className="optionsButton"
            onClick={() => selectOption('template')}
          >
            <h3>Template <span style={{ fontSize: '22px' }}><FaFolder style={{ cursor: 'pointer' }} /></span></h3>
            <p className="optionButtonDesc">Choose a question template to start with a preconstructed question.</p>
          </Button>
          <Button
            className="optionsButton"
          >
            <Dropzone
              onDrop={(acceptedFiles, rejectedFiles) => onDropFile(acceptedFiles, rejectedFiles)}
              multiple={false}
              style={{
                border: 'none',
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <h3>Upload <span style={{ fontSize: '22px' }}><FaUpload style={{ cursor: 'pointer' }} /></span></h3>
                  <p className="optionButtonDesc">Upload a JSON file containing a valid question.</p>
                </div>
              )}
            </Dropzone>
          </Button>
          <Button
            className="optionsButton"
            onClick={getQuestions}
          >
            <h3>Fork <span style={{ fontSize: '22px' }}><GoRepoForked style={{ cursor: 'pointer' }} /></span></h3>
            <p className="optionButtonDesc">Load from a previously asked question.</p>
          </Button>
        </Jumbotron>
      )}
      {step !== 'options' && (
        <Col md={12}>
          <h3 style={{ display: 'inline-block' }}>
            Question Title
          </h3>
          <Form
            horizontal
            onSubmit={(e) => e.preventDefault()}
            autoComplete="off"
          >
            <FormGroup
              bsSize="large"
              controlId="formHorizontalNodeIdName"
              validationState={questionStore.question_name.length > 0 ? 'success' : 'error'}
              style={{ margin: '0' }}
            >
              <FormControl
                type="text"
                value={questionStore.question_name}
                onChange={(e) => questionStore.updateQuestionName(e.target.value)}
                inputRef={(ref) => { questionName.current = ref; }}
                placeholder="Please provide a title for your question."
              />
            </FormGroup>
            {step === 'questionName' && (
              <Button
                id="questionNameSubmit"
                type="submit"
                onClick={() => setStep('build')}
                disabled={questionStore.question_name.length === 0}
              >
                Next
              </Button>
            )}
          </Form>
        </Col>
      )}
      {step === 'build' && (
        <div>
          <Col md={12}>
            <Panel>
              <Panel.Heading>
                <Panel.Title>
                  {'Question Graph Editor '}
                  <HelpButton link="machineQuestionEditor" />
                </Panel.Title>
              </Panel.Heading>
              <Panel.Body style={{ padding: '0px' }}>
                <QuestionGraphViewContainer
                  questionStore={questionStore}
                  height="350px"
                  width={width}
                />
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={12}>
            <NewQuestionButtons
              onDownloadQuestion={onDownloadQuestion}
              onResetQuestion={resetSteps}
              onSubmitQuestion={submit}
              validQuestion={questionStore.isValidQuestion()}
            />
          </Col>
        </div>
      )}
      <QuestionTemplateModal
        showModal={showModal}
        close={() => toggleModal(false)}
        selectQuestion={onQuestionTemplate}
      />
      <QuestionListModal
        show={questionsReady}
        close={() => setQuestionsReady(false)}
        questions={forkQuestions}
        questionSelected={onQuestionFork}
      />
    </div>
  );
}
