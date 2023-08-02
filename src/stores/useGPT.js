import { useState } from 'react';

export default function useGPT() {
  const [enabled, setEnabled] = useState(false);

  return {
    enabled,
    setEnabled,
  };
}
