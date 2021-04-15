function findKey(obj, prop) {
  const [s, t] = prop.split('--');
  const key = Object.keys(obj).find((k) => {
    const nodeIds = k.split('--');
    if (nodeIds.indexOf(s) > -1 && nodeIds.indexOf(t) > -1) {
      return true;
    }
    return false;
  });
  return key;
}

const edgeHandler = {
  get: (obj, prop) => {
    const key = findKey(obj, prop);
    let inverse = false;
    if (key) {
      if (key !== prop) {
        inverse = true;
      }
      return { indices: obj[key], inverse };
    }
    return { indices: [], inverse };
  },
  set: (obj, prop, val) => {
    const key = findKey(obj, prop);
    if (key) {
      obj[key] = val;
    } else {
      obj[prop] = val;
    }
    return true;
  },
};

function addEdgeIndices(edges) {
  // edge ends need the x and y of their attached nodes
  // must come after simulation
  const edgeIndices = new Proxy({}, edgeHandler);
  edges.forEach((e, i) => {
    const edgeObj = edgeIndices[`${e.subject}--${e.object}`];
    edgeObj.indices.push(i);
    edgeIndices[`${e.subject}--${e.object}`] = edgeObj.indices;
  });
  edges.forEach((e, i) => {
    const edgeObj = edgeIndices[`${e.subject}--${e.object}`];
    e.numEdges = edgeObj.indices.length;
    const edgeIndex = edgeObj.indices.indexOf(i);
    e.index = edgeIndex;
    // if an even number of edges, move first middle edge to outside
    // to keep edges symmetrical
    if (edgeObj.indices.length % 2 === 0 && edgeIndex === 0) {
      e.index = edgeObj.indices.length - 1;
    }
    // if not the first index (0)
    if (edgeIndex) {
      // all even index should be one less and odd indices
      // should be inverse
      const edgeL = edgeIndex % 2;
      if (!edgeL) {
        e.index -= 1;
      } else {
        e.index = -e.index;
      }
    }
    // flip any inverse edges
    if (edgeObj.inverse) {
      e.index = -e.index;
    }
    // if (edgeCount.counts.length > 5) {
    //   e.strokeWidth = edgeCount.count ? '3' : '30';
    // } else {
    e.strokeWidth = '3';
    // }
  });
  return edges;
}

export default {
  addEdgeIndices,
};
