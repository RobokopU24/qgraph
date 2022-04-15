import { useReducer } from 'react';

function reducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const { component, show } = action.payload;
      state[component].show = show;
      state[component].disabled = false;
      break;
    }
    case 'disable': {
      const { component } = action.payload;
      state[component].show = false;
      state[component].disabled = true;
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
    displayState: state,
    updateDisplayState: dispatch,
  };
}
