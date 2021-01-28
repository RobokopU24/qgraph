import React, { useContext, useEffect, useState } from 'react';

import API from '@/API';
import UserContext from '@/context/user';
import usePageStatus from '@/utils/usePageStatus';
import trapiUtils from '@/utils/trapiUtils';

import AnswersetView from './AnswersetView';

/*
 * Display an Answerset stored in Robokache
 * Wrapper around AnswersetView
 */
export default function StoredAnswersetView({ question_id, answer_id }) {
  const [message, setMessage] = useState(null);
  const pageStatus = usePageStatus(true);
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

    const newMessage =
      { ...questionResponseJSON, ...answerResponseJSON };

    const validationErrors = trapiUtils.validateMessage(message);
    if (validationErrors) {
      pageStatus.setFailure(
        `Found errors while parsing message: ${validationErrors.join(', ')}`,
      );
      return;
    }

    setMessage(newMessage);
    pageStatus.setSuccess();
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
            message={message}
            omitHeader
          />
        </>
      )}
    </>
  );
}
