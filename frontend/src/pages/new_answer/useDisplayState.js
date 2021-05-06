import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const { component, show } = action.payload;
      state[component].show = show;
      break;
    }
    default: {
      return { ...state };
    }
  }
  return { ...state };
}

export default function useDisplayState() {
  const [state, dispatch] = useReducer(reducer, {
    qg: { show: true, label: 'Query Graph' },
    kg: { show: true, label: 'Bubble Chart' },
    kgFull: { show: false, label: 'Knowledge Graph', disabled: true },
    results: { show: true, label: 'Results Table' },
  });

  return {
    state,
    dispatch,
  };
}
