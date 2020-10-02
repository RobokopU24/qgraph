import React, { useState } from 'react';

import { Row, Col } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Snackbar from '@material-ui/core/Snackbar';

import API from '@/API';

// import AppConfig from '../AppConfig';
import Loading from '../components/loading/Loading';
import AnswersetView from '../components/shared/answersetView/AnswersetView';
// import AnswersetStore from './stores/messageAnswersetStore';
import useMessageStore from '../stores/useMessageStore';
import config from '../config.json';
import parseMessage from '../utils/parseMessage';

export default function SimpleViewer(props) {
  const { user } = props;
  // We only read the communications config on creation
  // const [appConfig, setAppConfig] = useState(new AppConfig(config));
  const [messageSaved, setMessageSaved] = useState(false);
  const [loading, toggleLoading] = useState(false);
  // const [user, setUser] = useState({});
  // const [concepts, setConcepts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showSnackbar, toggleSnackbar] = useState(false);
  const messageStore = useMessageStore();

  async function uploadMessage() {
    const defaultQuestion = {
      parent: '',
      visibility: 1,
      metadata: { name: 'Simple Viewer Question' },
    };

    let response;

    // Create question
    response = await API.createQuestion(defaultQuestion, user.id_token);
    if (response.status === 'error') {
      setErrorMessage('Unable to create question.');
      return;
    }
    const questionId = response.id;

    // Upload question data
    const questionData = JSON.stringify(messageStore.message.query_graph);
    response = await API.setQuestionData(questionId, questionData, user.id_token);
    if (response.status === 'error') {
      setErrorMessage('Unable to upload question data.');
      return;
    }

    // Create Answer
    response = await API.createAnswer({ parent: questionId, visibility: 1 }, user.id_token);
    if (response.status === 'error') {
      setErrorMessage('Unable to create answer object.');
      return;
    }
    const answerId = response.id;
    // Upload answer data
    const answerData = JSON.stringify({
      knowledge_graph: messageStore.message.knowledge_graph,
      results: messageStore.message.results,
    });
    // Upload answer data
    response = await API.setAnswerData(answerId, answerData, user.id_token);
    if (response.status === 'error') {
      setErrorMessage('Unable to upload answer data.');
      return;
    }

    toggleSnackbar(true);
  }

  function onDrop(acceptedFiles) {
    acceptedFiles.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => {
        toggleLoading(true);
        setMessageSaved(false);
        setLoadingMessage('Loading Answers...');
      };
      // fr.onloadend = () => toggleLoading(false);
      fr.onload = (e) => {
        const fileContents = e.target.result;
        try {
          const message = JSON.parse(fileContents);
          const parsedMessage = parseMessage(message);
          messageStore.initializeMessage(parsedMessage);
          setMessageSaved(true);
        } catch (err) {
          console.log(err);
          // window.alert('Failed to load this Answerset file. Are you sure this is valid?');
          setErrorMessage('There was the problem loading the file. Is this valid JSON?');
        }
        toggleLoading(false);
      };
      fr.onerror = () => {
        // window.alert('Sorry but there was a problem uploading the file. The file may be invalid.');
        setErrorMessage('There was the problem loading the file. Is this valid JSON?');
      };
      fr.readAsText(file);
    });
  }

  return (
    <>
      {loading ? (
        <>
          <h1>
            {loadingMessage}
            <br />
          </h1>
          <Loading />
        </>
      ) : (
        <>
          {messageSaved && !errorMessage && (
            <>
              <AnswersetView
                user={user}
                concepts={config.concepts}
                messageStore={messageStore}
                omitHeader
              />
              {user && (
                <button type="button" onClick={uploadMessage}>Upload</button>
              )}
              <Snackbar
                open={showSnackbar}
                onClose={() => toggleSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                message="Message saved successfully!"
              />
            </>
          )}
          {!errorMessage && !messageSaved && (
            <Row>
              <Col md={12}>
                <h1>
                  Answer Set Explorer
                  <br />
                  <small>
                    Explore answers and visualize knowledge graphs.
                  </small>
                </h1>
                <Dropzone
                  onDrop={(acceptedFiles, rejectedFiles) => onDrop(acceptedFiles, rejectedFiles)}
                  multiple={false}
                  accept="application/json"
                >
                  {({ getRootProps, getInputProps }) => (
                    <section id="dropzoneContainer">
                      <div id="dropzone" {...getRootProps()} style={{ backgroundColor: config.colors.bluegray }}>
                        <input {...getInputProps()} />
                        <div style={{ display: 'table-cell', verticalAlign: 'middle' }}>
                          <h1 style={{ fontSize: '48px' }}>
                            <FaCloudUploadAlt />
                          </h1>
                          <h3>
                            Drag and drop an answerset file, or click to browse.
                          </h3>
                        </div>
                      </div>
                    </section>
                  )}
                </Dropzone>
              </Col>
            </Row>
          )}
          {errorMessage && (
            <>
              <h1>
                There was a problem loading the file.
              </h1>
              <br />
              <p>
                {errorMessage}
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
