/**
 * Keyboard shortcuts mapping for the Nuclear Challenge game
 * Used by KeyboardLegendModal to display available shortcuts
 */

export interface KeyboardShortcut {
  key: string;
  description: string;
  context: 'gameplay' | 'login' | 'global';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Login screen
  { key: 'Enter', description: 'Criar novo operador', context: 'login' },

  // Gameplay - Number pad
  { key: '0-9', description: 'Digitar número', context: 'gameplay' },
  { key: '1', description: 'Escolher opção 1 (durante seleção)', context: 'gameplay' },
  { key: '2', description: 'Escolher opção 2 (durante seleção)', context: 'gameplay' },

  // Gameplay - Controls
  { key: 'Enter', description: 'Confirmar resposta', context: 'gameplay' },
  { key: 'Backspace', description: 'Remover último dígito', context: 'gameplay' },
  { key: 'Escape', description: 'Limpar entrada', context: 'gameplay' },

  // Global
  { key: '?', description: 'Mostrar legenda de atalhos', context: 'global' },
];

export function getShortcutsForContext(context: 'gameplay' | 'login' | 'global' | 'all'): KeyboardShortcut[] {
  if (context === 'all') return KEYBOARD_SHORTCUTS;
  return KEYBOARD_SHORTCUTS.filter(s => s.context === context || s.context === 'global');
}
