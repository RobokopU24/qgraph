import React, { useState, useContext } from 'react';

import { Row, Col } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Button from '@material-ui/core/Button';

import API from '@/API';
import { useVisibility } from '@/utils/cache';
import AlertContext from '@/context/alert';
import config from '@/config.json';
import parseMessage from '@/utils/parseMessage';
import usePageStatus from '@/utils/usePageStatus';
import useMessageStore from '@/stores/useMessageStore';

import AnswersetView from '@/components/shared/answersetView/AnswersetView';

export default function SimpleViewer(props) {
  const { user } = props;
  const [messageSaved, setMessageSaved] = useState(false);
  const messageStore = useMessageStore();
  const pageStatus = usePageStatus(false);
  const visibility = useVisibility();
  const displayAlert = useContext(AlertContext);

  async function askQuestion() {
    const defaultQuestion = {
      parent: '',
      visibility: visibility.toInt('Private'),
      metadata: { name: 'Simple Viewer Question' },
    };
    let response;

    response = await API.cache.createQuestion(defaultQuestion, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }

    const questionId = response.id;
    // Upload question data
    const questionData = JSON.stringify(messageStore.message.query_graph);
    response = await API.cache.setQuestionData(questionId, questionData, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    response = await API.queryDispatcher.getAnswer(questionId, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    response = await API.cache.getQuestion(questionId, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    const questionMeta = response;
    questionMeta.metadata.hasAnswers = true;
    response = await API.cache.updateQuestion(questionMeta, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    displayAlert('success', 'A new ARA answer has been saved.');
  }

  async function uploadMessage() {
    const defaultQuestion = {
      parent: '',
      visibility: visibility.toInt('Private'),
      metadata: { name: 'Simple Viewer Question' },
    };

    let response;

    // Create question
    response = await API.cache.createQuestion(defaultQuestion, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    const questionId = response.id;

    // Upload question data
    const questionData = JSON.stringify(messageStore.message.query_graph);
    response = await API.cache.setQuestionData(questionId, questionData, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }

    // Create Answer
    response = await API.cache.createAnswer({ parent: questionId, visibility: 1 }, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    const answerId = response.id;
    // Upload answer data
    const answerData = JSON.stringify({
      knowledge_graph: messageStore.message.knowledge_graph,
      results: messageStore.message.results,
    });
    // Upload answer data
    response = await API.cache.setAnswerData(answerId, answerData, user.id_token);
    if (response.status === 'error') {
      pageStatus.setFailure(response.message);
      return;
    }
    displayAlert('success', 'Message saved successfully!');
  }

  function onDrop(acceptedFiles) {
    acceptedFiles.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => {
        pageStatus.setLoading('Loading message...');
        setMessageSaved(false);
      };
      fr.onload = (e) => {
        const fileContents = e.target.result;
        try {
          const message = JSON.parse(fileContents);
          const parsedMessage = parseMessage(message);
          messageStore.initializeMessage(parsedMessage);
          setMessageSaved(true);
          pageStatus.setSuccess();
        } catch (err) {
          console.log(err);
          pageStatus.setFailure('There was the problem loading the file. Is this valid JSON?');
        }
      };
      fr.onerror = () => {
        pageStatus.setFailure('There was the problem loading the file. Is this valid JSON?');
      };
      fr.readAsText(file);
    });
  }

  return (
    <>
      <pageStatus.Display />

      {pageStatus.displayPage && (
        <>
          {messageSaved ? (
            <>
              <AnswersetView
                user={user}
                concepts={config.concepts}
                messageStore={messageStore}
                omitHeader
              />
              {user && (
                <>
                  <Button
                    onClick={uploadMessage}
                    variant="contained"
                    style={{ marginRight: 10 }}
                  >
                    Upload
                  </Button>
                  <Button
                    onClick={askQuestion}
                    variant="contained"
                  >
                    Ask ARA
                  </Button>
                </>
              )}
            </>
          ) : (
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
        </>
      )}
    </>
  );
}
