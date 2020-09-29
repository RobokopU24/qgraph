import React, { useState, useContext, useEffect } from 'react';

import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';

import AnswersetView from './AnswersetView';
import Loading from '@/components/loading/Loading';
import useMessageStore from '@/stores/useMessageStore';
import config from '@/config.json';
import parseMessage from '@/utils/parseMessage';

import API from '@/API';
import UserContext from '@/user';

/*
 * Display an Answerset stored in Robokache
 * Wrapper around AnswersetView
 */
export default function StoredAnswersetView({ question_id, answer_id }) {
  const [loading, toggleLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const messageStore = useMessageStore();
  const user = useContext(UserContext);

  async function fetchQuestionAnswerData() {
    let questionPromise = API.getQuestionData(question_id, user && user.id_token);
    let answerPromise = API.getAnswerData(answer_id, user && user.id_token);

    let [ questionResponse, answerResponse ] =
       await Promise.all([questionPromise, answerPromise]);

    if (questionResponse.status == 'error') { 
      setErrorMessage(questionResponse.message);
      toggleLoading(false);
      return;
    }
    if (answerResponse.status == 'error') { 
      setErrorMessage(answerResponse.message);
      toggleLoading(false);
      return;
    }

    const message = 
      {...answerResponse, query_graph: questionResponse};

    const parsedMessage = parseMessage(message);
    messageStore.initializeMessage(parsedMessage);
    toggleLoading(false);
  }

  useEffect( () => {
    fetchQuestionAnswerData() 
  }, [question_id, answer_id, user]);

  return (
    <>
      { loading ? <Loading /> : (
        <>
          { errorMessage ? (
              <Box display="flex" justifyContent="center">
                <Alert variant="filled" severity="error">
                  {errorMessage}
                </Alert>
              </Box>
          ) : (
            <AnswersetView
              user={user}
              concepts={config.concepts}
              messageStore={messageStore}
              omitHeader />
          )}
        </>
      )}
    </>
  );
}
