'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'bolao-inprima-participante';

export function useParticipant() {
  const [participant, setParticipantState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setParticipantState(saved);
    setLoaded(true);
  }, []);

  function setParticipant(name: string) {
    window.localStorage.setItem(STORAGE_KEY, name);
    setParticipantState(name);
  }

  function clearParticipant() {
    window.localStorage.removeItem(STORAGE_KEY);
    setParticipantState(null);
  }

  return { participant, setParticipant, clearParticipant, loaded };
}
