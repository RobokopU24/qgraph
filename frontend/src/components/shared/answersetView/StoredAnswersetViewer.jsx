import React, { useContext, useEffect } from 'react';

import useMessageStore from '@/stores/useMessageStore';
import parseMessage from '@/utils/parseMessage';

import API from '@/API';
import UserContext from '@/context/user';
import usePageStatus from '@/utils/usePageStatus';

import AnswersetView from './AnswersetView';

/*
 * Display an Answerset stored in Robokache
 * Wrapper around AnswersetView
 */
export default function StoredAnswersetView({ question_id, answer_id }) {
  const pageStatus = usePageStatus(true);
  const messageStore = useMessageStore();
  const user = useContext(UserContext);

  async function fetchQuestionAnswerData() {
    const questionPromise = API.cache.getQuestionData(question_id, user && user.id_token);
    const answerPromise = API.cache.getAnswerData(answer_id, user && user.id_token);

    const [questionResponse, answerResponse] =
       await Promise.all([questionPromise, answerPromise]);

    if (questionResponse.status === 'error') {
      pageStatus.setFailure(questionResponse.message);
      return;
    }
    if (answerResponse.status === 'error') {
      pageStatus.setFailure(questionResponse.message);
      return;
    }

    let questionResponseJSON;
    try {
      questionResponseJSON = JSON.parse(questionResponse);
    } catch (err) {
      pageStatus.setFailure('Invalid question JSON');
      return;
    }

    let answerResponseJSON;
    try {
      answerResponseJSON = JSON.parse(answerResponse);
    } catch (err) {
      pageStatus.setFailure('Invalid answer JSON');
      return;
    }

    if (answerResponseJSON.status === 'error') {
      pageStatus.setFailure(
        `Error during answer processing: ${answerResponseJSON.message}`,
      );
      return;
    }

    const message =
      { ...questionResponseJSON, ...answerResponseJSON };

    let parsedMessage;
    try {
      parsedMessage = parseMessage(message);
    } catch (err) {
      pageStatus.setFailure(err.message);
    }

    try {
      messageStore.initializeMessage(parsedMessage);
      pageStatus.setSuccess();
    } catch (err) {
      pageStatus.setFailure(`Failed to fully load this message. ${err.message}`);
    }
  }

  useEffect(() => {
    fetchQuestionAnswerData();
  }, [question_id, answer_id, user]);

  return (
    <>
      <pageStatus.Display />

      { pageStatus.displayPage && (
        <>
          <AnswersetView
            user={user}
            messageStore={messageStore}
            omitHeader
          />
        </>
      )}
    </>
  );
}
