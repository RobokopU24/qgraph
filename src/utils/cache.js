/* eslint-disable react-hooks/rules-of-hooks */

/**
 * Convert a type of visibility to what Robokache is expecting
 * @param {('Invisible'|'Private'|'Shareable'|'Public')} value
 */
function useVisibility() {
  const visibilityMapping = {
    0: 'Invisible',
    1: 'Private',
    2: 'Shareable',
    3: 'Public',
  };

  function toString(key) {
    return visibilityMapping[key];
  }

  function toInt(val) {
    return parseInt(Object.keys(visibilityMapping).find((key) => visibilityMapping[key] === val), 10);
  }

  return {
    toString,
    toInt,
  };
}

function formatDateTimeNicely(dateString) {
  const jsDate = new Date(dateString);
  const options = {
    dateStyle: 'long',
    timeStyle: 'long',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}

function formatDateTimeShort(dateString) {
  const jsDate = new Date(dateString);
  const options = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: true,
  };
  return Intl.DateTimeFormat('en-US', options).format(jsDate);
}

/**
 * Default new question object for Robokache
 */
const defaultQuestion = {
  parent: '',
  visibility: useVisibility().toInt('Shareable'),
  metadata: { name: 'New Question' },
};

/**
 * Default new answer only object for Robokache
 */
const defaultAnswer = {
  parent: '',
  visibility: useVisibility().toInt('Shareable'),
  metadata: {
    name: 'Uploaded Answer',
    answerOnly: true,
    hasAnswers: true,
  },
};

export {
  useVisibility,
  formatDateTimeNicely,
  formatDateTimeShort,
  defaultQuestion,
  defaultAnswer,
};
