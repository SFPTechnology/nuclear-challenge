import { useState, useEffect, useRef } from 'react';

export function useUIState() {
  const [mode, setMode] = useState<'login' | 'menu' | 'play' | 'pause' | 'analise' | 'quit'>('login');
  const [boom, setBoom] = useState(false);
  const [snd, setSnd] = useState(true);
  const [diff, setDiff] = useState(3);
  const [selectedOperatorToExclude, setSelectedOperatorToExclude] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [calendarCursor, setCalendarCursor] = useState(() => new Date());
  const [nameInput, setNameInput] = useState('');

  // Focus management for A11y
  const prevModeRef = useRef(mode);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      // Mode changed - restore focus to trigger button if available
      if (triggerButtonRef.current) {
        // Small delay to allow DOM to update
        setTimeout(() => {
          if (triggerButtonRef.current) {
            triggerButtonRef.current.focus();
            console.log(`[A11y] Focus restored after mode transition: ${prevModeRef.current} → ${mode}`);
          }
        }, 100);
      }
      prevModeRef.current = mode;
    }
  }, [mode]);

  return {
    mode, setMode,
    boom, setBoom,
    snd, setSnd,
    diff, setDiff,
    selectedOperatorToExclude, setSelectedOperatorToExclude,
    calendarCursor, setCalendarCursor,
    nameInput, setNameInput,
    triggerButtonRef
  };
}
