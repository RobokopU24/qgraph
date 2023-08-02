import { useState } from 'react';

export default function useGPT() {
  const [token, setToken] = useState('');

  const enabled = token !== '';

  return {
    enabled,
    token,
    setToken,
  };
}
