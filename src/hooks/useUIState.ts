import { useState, useEffect, useRef } from 'react';

/** Every screen App.tsx can route to. */
export type AppMode =
  | 'login'
  | 'menu'
  | 'ranking'
  | 'analise'
  | 'nc003'
  | 'play'
  | 'pause'
  | 'win'
  | 'lose'
  | 'quit';

export function useUIState() {
  // The union previously omitted 'ranking' | 'nc003' | 'win' | 'lose' even though
  // App.tsx routes to all of them, which made every setMode call a type error.
  const [mode, setMode] = useState<AppMode>('login');
  const [boom, setBoom] = useState(false);
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
    diff, setDiff,
    selectedOperatorToExclude, setSelectedOperatorToExclude,
    calendarCursor, setCalendarCursor,
    nameInput, setNameInput,
    triggerButtonRef
  };
}
