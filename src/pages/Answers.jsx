import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import InputLabel from '@material-ui/core/InputLabel';

import API from '@/API';

import Loading from '../components/loading/Loading';
import AnswersetView from '../components/shared/answersetView/AnswersetView';
import useMessageStore from '../stores/useMessageStore';

import config from '../config.json';

/**
 * Answer viewer
 * @param {object} user user object
 */
export default function Answer({ user }) {
  const { question_id } = useParams();
  const [loading, toggleLoading] = useState(true);
  const [messageSaved, setMessageSaved] = useState(false);
  // const [visibility, setVisibility] = useState(1);
  const [errorMessage, setErrorMessage] = useState('Something went wrong. Check the console for more information.');
  const messageStore = useMessageStore();

  async function fetchQuestionAnswerData() {
    let token;
    if (user) {
      token = user.id_token;
    }

    let response;
    response = await API.cache.getQuestionData(question_id, token);
    if (response.status === 'error') {
      setErrorMessage('Unable to load question.');
      toggleLoading(false);
      return;
    }
    const query_graph = response;

    response = await API.cache.getAnswersByQuestion(question_id, token);
    if (response.status === 'error') {
      setErrorMessage('Unable to get answers to question.');
      toggleLoading(false);
      return;
    }
    const answers = response;
    // Pick the first answer
    if (answers.length === 0) {
      setErrorMessage('No answers found.');
      toggleLoading(false);
      return;
    }

    const selected_answer = answers[0];
    response = await API.cache.getAnswerData(selected_answer.id, token);
    if (response.status === 'error') {
      setErrorMessage('Unable to get answer data.');
      toggleLoading(false);
      return;
    }

    const { knowledge_graph, results } = response;
    const message = { query_graph, knowledge_graph, results };
    messageStore.initializeMessage(message);
    setMessageSaved(true);
    toggleLoading(false);
  }

  useEffect(() => {
    fetchQuestionAnswerData();
  }, [question_id, user]);

  // useEffect(() => {
  //   console.log('visiblity set to', visibility);
  // }, [visibility]);

  return (
    <>
      {!loading ? (
        <>
          {messageSaved ? (
            <>
              {/* <FormControl>
                <InputLabel id="questionVisibility">Question Visibility</InputLabel>
                <Select
                  labelId="questionVisibility"
                  id="visibilitySelect"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <MenuItem value={1}>Private</MenuItem>
                  <MenuItem value={2}>Shareable</MenuItem>
                  <MenuItem value={3}>Public</MenuItem>
                </Select>
              </FormControl> */}
              <AnswersetView
                messageStore={messageStore}
                concepts={config.concepts}
                omitHeader
              />
            </>
          ) : (
            <h3>{errorMessage}</h3>
          )}
        </>
      ) : (
        <Loading />
      )}
    </>
  );
}
