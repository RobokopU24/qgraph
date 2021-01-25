import { renderHook, act } from '@testing-library/react-hooks';
import useQuestionStore from '../src/pages/question/useQuestionStore';

const testGoodQuery = {
  nodes: {
    n0: {
      category: 'disease',
    },
    n1: {
      category: 'gene',
    },
  },
  edges: {
    e0: {
      subject: 'n0',
      object: 'n1',
    },
  },
};

const testBadQuery = {
  nodes: {
    n0: {
      category: 'disease',
    },
  },
};

const testDeletedQuery = {
  nodes: {
    n0: {
      category: 'disease',
      deleted: true,
    },
    n1: {
      category: 'gene',
    },
  },
  edges: {
    e0: {
      subject: 'n0',
      object: 'n1',
    },
  },
};

describe('useQuestionStore Hook', () => {
  it('should pass a valid query', () => {
    const { result } = renderHook(() => useQuestionStore());
    act(() => {
      result.current.updateQueryGraph(testGoodQuery);
    });
    expect(result.current.isValidQuestion()).toBeTruthy();
  });
  it('should reset a query', () => {
    const { result } = renderHook(() => useQuestionStore());
    const query = result.current.query_graph;
    act(() => {
      result.current.updateQueryGraph(testGoodQuery);
    });
    expect(result.current.query_graph).toEqual(testGoodQuery);
    act(() => {
      result.current.resetQuestion();
    });
    expect(result.current.query_graph).toEqual(query);
  });
  it('should fail a bad query', () => {
    const { result } = renderHook(() => useQuestionStore());
    act(() => {
      result.current.updateQueryGraph(testBadQuery);
    });
    expect(result.current.isValidQuestion()).toBe(false);
  });
  it('should fail a deleted node query', () => {
    const { result } = renderHook(() => useQuestionStore());
    act(() => {
      result.current.updateQueryGraph(testDeletedQuery);
    });
    expect(result.current.isValidQuestion()).toBe(false);
  });
});
