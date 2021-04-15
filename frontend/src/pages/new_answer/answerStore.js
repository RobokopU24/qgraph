import { useState, useEffect, useRef } from 'react';

import kgUtils from './utils/kgUtils';
import resultsUtils from './utils/resultsUtils';

export default function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  function initialize(msg, concepts) {
    setMessage(msg);
    setKgNodes(kgUtils.makeDisplayNodes(msg));
    setTableHeaders(resultsUtils.makeTableHeaders(msg, concepts));
  }

  return {
    initialize,
    message,

    kgNodes,

    tableHeaders,
  };
}
