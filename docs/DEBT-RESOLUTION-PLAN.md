# Plano de Resolução de Débitos Técnicos
**Projeto:** Nuclear Challenge  
**Data:** 2026-09-08  
**Preparado por:** Orion (AIOX Master)  
**Status:** Ready for Execution  
**Versão:** 1.0

---

## 🎯 Executive Summary

**47 débitos técnicos mapeados.** Destes:
- **4 críticos de segurança/dados** (risco físico ou perda irreversível)
- **6 críticos de qualidade** (falsa sensação de conformidade)
- **14 altos** (bloqueiam features)
- **18 médios** (degradação gradual)
- **5 baixos** (nice-to-have)

**Custo total:** ≥ R$ 100.500  
**Tempo:** 5-8 sprints (assumindo 1-2 devs, 40h/semana)

---

## 🚨 FASE 0: P0-SAFETY & P0-DATA (Autorizado, Não Executado)

**⏱️ Duração:** 3-4 horas  
**👤 Assignee:** @dev  
**🔓 Bloqueio:** NONE (decisão já foi tomada em ciclo anterior)

### P0-SAFETY: UX-D07 - Animações sem `prefers-reduced-motion`

**O Problema:**
```javascript
// src/App.tsx — Línea ~340-360
// Efeitos visuais SEM respeit a prefers-reduced-motion:
// - rumbleHard: 11,1 Hz (fotoconvulsivo)
// - glitch: 11,1 Hz (fotoconvulsivo)
// - rumble: 8,3 Hz (vestibular)
// - grainShift: 3,57 Hz (vestibular)

// Hoje: sem escape, sem preferência de usuário
```

**Solução:**
```typescript
// Adicionar ao topo de App.tsx:
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Em cada animação:
if (prefersReducedMotion) {
  // Remover/desabilitar efeito
  // OU usar versão estática/reduzida
}

// Exemplo para rumbleHard:
const applyRumble = (intensity: number) => {
  if (prefersReducedMotion) return; // Skip entirely
  // ... original rumble code
};
```

**Checklist:**
- [ ] Ler `prefers-reduced-motion` no mount
- [ ] Aplicar em 4 efeitos: rumbleHard, glitch, rumble, grainShift
- [ ] Testar com `prefers-reduced-motion: reduce` no DevTools
- [ ] Verificar que UX permanece clara mesmo sem efeitos
- [ ] Commit: `fix: respect prefers-reduced-motion to prevent seizure risk [UX-D07]`

**Tempo estimado:** 1,75 horas  
**Dependências:** NONE  
**Bloqueia:** Nada (P0 significa zero dependências)

---

### P0-DATA: TD-DAT-01 & TD-DAT-02 - Perda Silenciosa de Dados

**O Problema:**
```javascript
// Dois bugs independentes no window.storage:
// 1. Falha silenciosa em read → próximo write sobrescreve histórico inteiro
// 2. Sem backup/rollback → perda irreversível

// Exemplo: Turma inteira perde seu histórico sem log
```

**Solução:**
```typescript
// 1. Implementar try/catch explícito + logging
const readTurmaData = () => {
  try {
    const data = JSON.parse(window.localStorage.getItem('turma'));
    if (!data) throw new Error('No data');
    return data;
  } catch (e) {
    console.error('[StorageAdapter] Read failed:', e);
    // NÃO retornar undefined — retornar padrão seguro
    return { operadores: [], historico: [] };
  }
};

// 2. Implementar backup/snapshot antes de write
const writeTurmaData = (data) => {
  // Backup antes de sobrescrever
  const backup = window.localStorage.getItem('turma_backup');
  window.localStorage.setItem('turma_backup', backup);
  
  // Escrever novo
  window.localStorage.setItem('turma', JSON.stringify(data));
};

// 3. Implementar rollback se necessário
const rollbackTurmaData = () => {
  const backup = window.localStorage.getItem('turma_backup');
  if (backup) {
    window.localStorage.setItem('turma', backup);
    return true;
  }
  return false;
};
```

**Checklist:**
- [ ] Adicionar try/catch em todos os reads do `window.storage`
- [ ] Implementar backup automático antes de writes
- [ ] Adicionar logging de erro (console.error com contexto)
- [ ] Implementar recovery function
- [ ] Testar cenário: localStorage.clear() durante read
- [ ] Commit: `fix: implement data backup and recovery [TD-DAT-01, TD-DAT-02]`

**Tempo estimado:** 2-3 horas  
**Dependências:** NONE  
**Bloqueia:** TD-SYS-09 (parcialmente)

---

## ✅ FASE 1: Foundation (Sprint 1-2)

**⏱️ Duração:** 2 semanas  
**👤 Assignee:** @dev + @devops  
**🔓 Bloqueio:** NONE (independente)

### 1.1 - Git Initialization (TD-SYS-04)

**O Problema:**
```
$ ls -la | grep .git
# Nada — não há versionamento
```

**Solução:**
```bash
# 1. Inicializar repositório
git init
git config user.name "Nuclear Challenge Team"
git config user.email "team@nuclear-challenge.local"

# 2. Criar .gitignore completo
cat > .gitignore << 'EOF'
node_modules/
dist/
.env.local
.env.*.local
*.log
.DS_Store
.idea/
.vscode/local-settings.json
coverage/
EOF

# 3. Staged & commit inicial
git add .
git commit -m "init: initialize git repository [TD-SYS-04]"

# 4. Criar main branch
git checkout -b main
```

**Checklist:**
- [ ] `git init`
- [ ] `.gitignore` abrange node_modules, dist, .env, logs
- [ ] `.gitignore` EXCLUI `Arquivos_Diversos/` (temporariamente, até TD-SYS-05)
- [ ] Initial commit com history limpo
- [ ] Criar branch `main` protegida
- [ ] Commit: `init: initialize git repository [TD-SYS-04]`

**Tempo estimado:** 0.5 horas  
**Dependências:** NONE  
**Bloqueia:** Tudo (Git é pré-requisito)

---

### 1.2 - TypeCheck Activation (TD-SYS-01)

**O Problema:**
```typescript
// src/App.tsx — Linha 1
// @ts-nocheck ← isso desativa TypeScript inteiro
```

**Solução:**
```typescript
// 1. Remover @ts-nocheck
// Antes: // @ts-nocheck
// Depois: (remover)

// 2. Atualizar tsconfig.json
{
  "compilerOptions": {
    "strict": true,  // ← mudou de false
    "checkJs": true, // ← mudou de false
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// 3. Corrigir erros de type
// npm run typecheck 2>&1 | head -50
// Corrigir cada erro conforme aparecer
```

**Checklist:**
- [ ] Remover `// @ts-nocheck` do topo de App.tsx
- [ ] Atualizar `tsconfig.json`: `strict: true`, `checkJs: true`
- [ ] Executar `npm run typecheck`
- [ ] Corrigir erros de type (provavelmente 50-100)
- [ ] Todos os testes ainda passam
- [ ] Commit: `fix: activate strict TypeScript checking [TD-SYS-01]`

**Tempo estimado:** 3-4 horas  
**Dependências:** 1.1 (Git)  
**Bloqueia:** 1.3, 1.4, 2.1

---

### 1.3 - ESLint Configuration (TD-SYS-02)

**O Problema:**
```javascript
// eslint.config.js
// files: excludes .tsx — cobre ~2%
// Sem plugins React/hooks/a11y/security
```

**Solução:**
```javascript
// eslint.config.js — reescrever completo
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: ['dist/', 'node_modules/', '.git/']
  },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],  // ← mudou de excludes
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2024
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': a11y
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...a11y.configs.recommended.rules,
      // Custom rules
      'react/react-in-jsx-scope': 'off', // React 17+
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/click-events-have-key-events': 'error'
    }
  }
];
```

**Checklist:**
- [ ] Atualizar `eslint.config.js` para incluir 100% dos .tsx
- [ ] Adicionar plugins: react, react-hooks, jsx-a11y, security
- [ ] Executar `npm run lint`
- [ ] Corrigir erros (provavelmente 200-500)
- [ ] Atualizar GitHub Actions (se houver)
- [ ] Commit: `fix: enable ESLint for all source files [TD-SYS-02]`

**Tempo estimado:** 4-6 horas  
**Dependências:** 1.1, 1.2  
**Bloqueia:** 1.4, 2.1

---

### 1.4 - Test Suite Repair (TD-SYS-03)

**O Problema:**
```javascript
// Mutação de código provou:
// - Gate aprova destruição total de funcionalidade
// - Gate reprova a mesma funcionalidade só por estar formatada diferente
// = ZERO valor behavioural
```

**Solução:**
```typescript
// Exemplo: Teste atual (inútil)
describe('App', () => {
  it('renders', () => {
    render(<App />);
    // Não verifica NADA
  });
});

// Novo teste (com valor)
describe('App - Operator Management', () => {
  it('should add operator to turma', () => {
    render(<App />);
    
    // 1. Verificar estado inicial (vazio)
    expect(screen.queryByText(/Operador 1/)).not.toBeInTheDocument();
    
    // 2. Executar ação (adicionar operador)
    const addBtn = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(addBtn);
    
    // 3. Verificar resultado (operador adicionado)
    expect(screen.getByText(/Operador 1/)).toBeInTheDocument();
  });

  it('should persist operator to localStorage', () => {
    render(<App />);
    
    const addBtn = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(addBtn);
    
    // 4. Verificar persistência
    const stored = JSON.parse(window.localStorage.getItem('turma'));
    expect(stored.operadores).toHaveLength(1);
  });

  it('should NOT add operator if form is empty', () => {
    render(<App />);
    
    const addBtn = screen.getByRole('button', { name: /adicionar/i });
    fireEvent.click(addBtn); // Sem input
    
    // Verificar que NÃO foi adicionado
    expect(screen.queryByText(/Operador 1/)).not.toBeInTheDocument();
  });
});
```

**Checklist:**
- [ ] Auditar todos os testes: verificam BEHAVIOR real?
- [ ] Reescrever testes frágeis (>30% do suite)
- [ ] Adicionar testes de edge cases
- [ ] Adicionar testes de integração (UI → Storage)
- [ ] Executar `npm run test:coverage` — mínimo 70%
- [ ] Mutação testing (com ferramentas ou manual)
- [ ] Commit: `test: repair test suite with behavioral coverage [TD-SYS-03]`

**Tempo estimado:** 6-8 horas  
**Dependências:** 1.1, 1.2, 1.3  
**Bloqueia:** 2.1, 2.2

---

## 🏗️ FASE 2: Architecture Refactor (Sprint 3-4)

**⏱️ Duração:** 2 semanas  
**👤 Assignee:** @dev + @architect  
**🔓 Bloqueio:** NONE (mas beneficia de Phase 1)

### 2.1 - Fronteira de Código (TD-SYS-05)

**O Problema:**
```
Arquivos_Diversos/
  ├── App.tsx (1.070 linhas)
  ├── estilos.css
  └── ... tudo junto
  
Causa raiz: TD-SYS-02, TD-SYS-16, TD-SYS-06
```

**Solução:**
```
src/
├── main.tsx
├── App.tsx (refatorado para orquestração)
├── components/
│   ├── Turma/
│   │   ├── TurmaForm.tsx
│   │   ├── TurmaList.tsx
│   │   └── TurmaCard.tsx
│   ├── Operator/
│   │   ├── OperatorPanel.tsx
│   │   ├── OperatorRegistry.tsx
│   │   └── OperatorStats.tsx
│   └── Shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Button.tsx
├── domain/
│   ├── models/
│   │   ├── Turma.ts
│   │   └── Operator.ts
│   └── services/
│       ├── TurmaService.ts
│       └── OperatorService.ts
├── hooks/
│   ├── useTurmaRegistry.ts
│   ├── useOperatorState.ts
│   └── usePhysicsEngine.ts
├── styles/
│   ├── index.css
│   └── tokens.css
└── utils/
    ├── storage.ts
    └── validators.ts
```

**Checklist:**
- [ ] Criar estrutura acima
- [ ] Extrair componentes de App.tsx (20-30 componentes)
- [ ] Implementar domain models (Turma, Operator)
- [ ] Implementar domain services (TurmaService, OperatorService)
- [ ] Mover hooks para `src/hooks/`
- [ ] Mover estilos para `src/styles/`
- [ ] Atualizar imports
- [ ] Testes passam 100%
- [ ] Deletar `Arquivos_Diversos/`
- [ ] Commit: `refactor: reorganize project structure [TD-SYS-05]`

**Tempo estimado:** 8-10 horas  
**Dependências:** 1.1, 1.2, 1.3, 1.4  
**Bloqueia:** 2.2, 3.1

---

### 2.2 - Monolito Descomposto (TD-SYS-06)

**O Problema:**
```typescript
// App.tsx tem 1.070 linhas
// 42 useState
// 20 useEffect
// Impossible to refactor safely
```

**Solução:**
```typescript
// Já foi iniciado em commit anterior (refactor: extract physics and scoring state)
// Continuar extração:

// hooks/usePhysicsEngine.ts
export const usePhysicsEngine = () => {
  const [aceleracao, setAceleracao] = useState(0);
  const [pressao, setPressao] = useState(0);
  // ... 10+ states relacionados a física
  
  return { aceleracao, pressao, ... };
};

// hooks/useTurmaRegistry.ts
export const useTurmaRegistry = () => {
  const [operadores, setOperadores] = useState([]);
  const [historico, setHistorico] = useState([]);
  // ... 15+ states relacionados a turma
  
  return { operadores, historico, ... };
};

// hooks/useUIState.ts
export const useUIState = () => {
  const [modo, setModo] = useState('simulacao');
  const [alertas, setAlertas] = useState([]);
  // ... 8+ states relacionados a UI
  
  return { modo, alertas, ... };
};

// Depois, App.tsx fica:
export const App = () => {
  const physics = usePhysicsEngine();
  const turma = useTurmaRegistry();
  const ui = useUIState();
  
  return (
    <div>
      {/* Apenas orquestração */}
    </div>
  );
};
```

**Checklist:**
- [ ] Criar `src/hooks/usePhysicsEngine.ts`
- [ ] Criar `src/hooks/useTurmaRegistry.ts`
- [ ] Criar `src/hooks/useUIState.ts`
- [ ] Migrar states relacionados para cada hook
- [ ] App.tsx reduzido para <200 linhas
- [ ] Todos os useEffect movidos para hooks apropriados
- [ ] Testes passam 100%
- [ ] Commit: `refactor: extract specialized hooks [TD-SYS-06]`

**Tempo estimado:** 6-8 horas  
**Dependências:** 2.1  
**Bloqueia:** 3.1, 3.2

---

## 🎨 FASE 3: Acessibilidade (Sprint 5-7)

**⏱️ Duração:** 3 semanas  
**👤 Assignee:** @ux-design-expert + @dev  
**🔓 Bloqueio:** NONE (mas melhor após Phase 2)

### 3.1 - A11y Foundation (UX-D05, UX-D23, UX-D25)

**O Problema:**
```
- 3 aria-* attributes
- 0 role attributes
- 0 tabIndex
- 24/27 botões sem nome acessível
- 100 font-size em px (0 rem/em)
```

**Solução - Semantic HTML:**
```typescript
// Antes (inacessível)
<div onClick={handleClick} style={{cursor: 'pointer'}}>
  Adicionar
</div>

// Depois (acessível)
<button
  onClick={handleClick}
  aria-label="Adicionar novo operador"
  type="button"
>
  Adicionar
</button>
```

**Solução - Font Size (px → rem):**
```css
/* Antes */
.heading { font-size: 32px; }
.body { font-size: 16px; }
.small { font-size: 12px; }

/* Depois */
:root {
  --font-size-base: 1rem; /* 16px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.5rem; /* 24px */
  --font-size-2xl: 2rem; /* 32px */
}

.heading { font-size: var(--font-size-2xl); }
.body { font-size: var(--font-size-base); }
.small { font-size: var(--font-size-sm); }
```

**Checklist:**
- [ ] Converter todos os `<div>` clicáveis para `<button>`
- [ ] Adicionar `aria-label` a todos os botões sem texto
- [ ] Converter todos os font-size de px para rem
- [ ] Adicionar `role` onde necessário (menu, menuitem, etc.)
- [ ] Adicionar `tabIndex={0}` para elementos focáveis
- [ ] Testar com keyboard: Tab, Enter, Escape
- [ ] Testar com leitor de tela (NVDA/JAWS/VoiceOver)
- [ ] Commit: `fix: implement accessibility foundation [UX-D05, UX-D23, UX-D25]`

**Tempo estimado:** 12-16 horas  
**Dependências:** 2.1, 2.2  
**Bloqueia:** 3.2, 3.3

---

### 3.2 - Color & Contrast (UX-D06, UX-D14)

**O Problema:**
```
WCAG 1.4.1: Cor como canal semântico único
- Vermelho = perigo (ilegível para daltônicos)
- Azul = ativo (confunde leitor de tela)

Contraste atual:
- #6b7280 (fundo): falha em 6 fundos
- #ef4444 (vermelho): 3,54:1 (falha AA)
- #8d959e: 4,39:1 (marginal)
```

**Solução:**
```typescript
// Antes (cor só)
<div style={{backgroundColor: '#ef4444'}}>
  ⚠️ Falha crítica
</div>

// Depois (cor + ícone + texto)
<div 
  style={{backgroundColor: '#ef4444'}}
  role="alert"
  aria-label="Falha crítica: Pressão acima do limite"
>
  <AlertIcon /> Pressão acima do limite
</div>

// Cores com contraste WCAG AA (4.5:1 mínimo)
const colors = {
  danger: '#b91c1c', // Vermelho mais escuro (5:1)
  success: '#15803d', // Verde mais escuro (5:1)
  warning: '#b45309', // Amarelo mais escuro (5:1)
  info: '#0369a1', // Azul mais escuro (4.5:1)
  // Adicionar complementos visuais (ícones, padrões)
};
```

**Checklist:**
- [ ] Auditar todas as cores com ferramentas (WebAIM Contrast Checker)
- [ ] Aumentar contraste de #ef4444, #6b7280, #8d959e
- [ ] Adicionar ícones a estados semânticos (✓, ⚠️, ✖, ℹ)
- [ ] Adicionar padrões visuais (linhas, tracejados) além de cor
- [ ] Testar com ferramentas de simulação de daltonismo
- [ ] Commit: `fix: improve color contrast and add visual indicators [UX-D06, UX-D14]`

**Tempo estimado:** 6-8 horas  
**Dependências:** 3.1  
**Bloqueia:** 3.3

---

### 3.3 - Focus & Navigation (UX-D19, UX-D25)

**O Problema:**
```
- Foco não gerenciado em 9 transições de mode
- Sem legenda de atalhos de teclado
- Navegação por teclado quebrada
```

**Solução:**
```typescript
// Focus management
import { useEffect, useRef } from 'react';

export const ModeTransition = ({ mode, onModeChange }) => {
  const focusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Quando modo muda, retornar foco para botão de transição
    if (focusRef.current) {
      focusRef.current.focus();
      // Anunciar mudança para leitores de tela
      announceToA11y(`Modo alterado para ${mode}`);
    }
  }, [mode]);

  return (
    <>
      <button
        ref={focusRef}
        onClick={() => onModeChange('next')}
        aria-label={`Modo atual: ${mode}. Pressione Enter para próximo.`}
      >
        {mode}
      </button>
      
      {/* Legenda de atalhos */}
      <details>
        <summary>Atalhos de teclado</summary>
        <ul>
          <li><kbd>Tab</kbd> — Navegar entre elementos</li>
          <li><kbd>Enter</kbd> — Ativar botão</li>
          <li><kbd>Space</kbd> — Ativar checkbox</li>
          <li><kbd>Esc</kbd> — Fechar modal</li>
          <li><kbd>?</kbd> — Esta legenda</li>
        </ul>
      </details>
    </>
  );
};

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAllModals();
    if (e.key === '?') toggleShortcutLegend();
    if (e.key === 'Enter' && e.target === focusRef.current) {
      onModeChange('next');
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Checklist:**
- [ ] Implementar `useRef` + `focus()` em 9 transições
- [ ] Adicionar `aria-live` para anúncios
- [ ] Criar legenda de atalhos (Ctrl+?, ou Help button)
- [ ] Testar Tab order (sequência lógica)
- [ ] Testar com teclado apenas (sem mouse)
- [ ] Commit: `fix: implement focus management and keyboard navigation [UX-D19, UX-D25]`

**Tempo estimado:** 4-6 horas  
**Dependências:** 3.1, 3.2  
**Bloqueia:** 4.1

---

## 🧪 FASE 4: Quality Gates (Sprint 8)

**⏱️ Duração:** 1 semana  
**👤 Assignee:** @qa + @dev  
**🔓 Bloqueio:** 3.3 (tests, lint, typecheck)

### 4.1 - Gate Activation

```bash
# Pré-Flight Check
npm run typecheck      # Deve passar 100%
npm run lint           # Deve passar 0 warnings
npm run test           # Deve passar 100%
npm run test:coverage  # Deve ter >80%
npm run build          # Deve gerar dist/ sem erros
```

**Checklist:**
- [ ] `npm run typecheck` — ✅ sem erros
- [ ] `npm run lint` — ✅ 0 warnings (--max-warnings=0)
- [ ] `npm run test` — ✅ 100% passing
- [ ] `npm run test:coverage` — ✅ >80%
- [ ] `npm run build` — ✅ <500KB gzipped
- [ ] Nenhum console.error em build production
- [ ] Commit: `chore: activate quality gates [TD-SYS-01, TD-SYS-02, TD-SYS-03]`

**Tempo estimado:** 2-4 horas  
**Dependências:** 3.3  
**Bloqueia:** 5.1

---

## 🔄 FASE 5: Remaining Debts (Sprint 9+)

**⏱️ Duração:** 3-4 semanas (incremental)  
**👤 Assignee:** @dev (quando resources disponível)

### Priority Ranking (por impacto/esforço)

| Prio | ID | Débito | Severidade | Horas | Impacto |
|------|---|---|---|---|---|
| 1 | UX-D10 | Empty states | ALTA | 10 | NC-001/002 AC explícito |
| 2 | UX-D02 | Design system | ALTA | 24 | Maintainability |
| 3 | TD-SYS-06 | (Já feito em Phase 2) | - | - | - |
| 4 | UX-D16 | Screen layouts | MÉDIA | 20 | UX foundation |
| 5 | TD-SYS-18 | Observability | ALTA | M | Error recovery |
| 6 | UX-D11 | Responsividade | MÉDIA | 16 | Mobile support |
| 7 | TD-SYS-12 | Bundle splitting | MÉDIA | M | Performance |
| 8 | UX-D22 | CSS injection | MÉDIA | 3 | Auditability |
| 9 | TD-SYS-13 | Config hardcoding | MÉDIA | S | Flexibility |
| 10 | UX-D24 | Privacy (pseudonimização) | ALTA | 8 | Legal/LGPD |

---

## 📊 Cronograma Consolidado

```
Sprint 1-2 (2 sem):  Phase 0 + Phase 1 (Foundation)
  └─ P0-SAFETY, P0-DATA, Git, TypeCheck, ESLint, Tests

Sprint 3-4 (2 sem):  Phase 2 (Architecture)
  └─ Fronteira de código, Monolito descomposto

Sprint 5-7 (3 sem):  Phase 3 (A11y)
  └─ Foundation, Color/Contrast, Focus/Navigation

Sprint 8 (1 sem):    Phase 4 (Quality Gates)
  └─ Ativar gates, verificar cobertura

Sprint 9+ (3-4 sem): Phase 5 (Remaining)
  └─ Empty states, Design system, etc.

─────────────────────
TOTAL: 11-13 semanas (3 meses)
```

---

## 💰 Investimento Total

```
Phase 0: 3-4h × R$ 150 = R$ 450-600
Phase 1: 14h × R$ 150 = R$ 2.100
Phase 2: 14-18h × R$ 150 = R$ 2.100-2.700
Phase 3: 26-30h × R$ 150 = R$ 3.900-4.500
Phase 4: 2-4h × R$ 150 = R$ 300-600
Phase 5: ~90h (estimado) × R$ 150 = ~R$ 13.500

─────────────────────
SUBTOTAL: ~R$ 22.350-24.300 (labor)

+
Remaining 23 débitos (system/data):
  ≥ R$ 81.000 (piso, estimado)

─────────────────────
TOTAL: ≥ R$ 103.000+
```

---

## 🎯 Success Criteria

**Ao final de Phase 4:**
```
✅ P0-SAFETY resolvido (sem risco de dano físico)
✅ P0-DATA resolvido (sem perda de dados)
✅ Git funcionando (todas as alterações rastreáveis)
✅ TypeCheck 100% (zero type errors)
✅ ESLint 100% (zero violations)
✅ Testes com valor (behavioral coverage >80%)
✅ Estrutura de código legível (componentes <200 LOC)
✅ A11y foundation implementada (WCAG 2.1 AA baseline)
```

**Ao final de Phase 5:**
```
✅ 47 débitos rastreados e priorizados
✅ 30+ débitos resolvidos (Phase 0-4 + prioritized Phase 5)
✅ 17+ débitos em backlog (Phase 5 restante)
✅ Produto seguro para lançamento em produção
✅ Equipe confiante para manutenção futura
```

---

## 🚀 Recomendação Final

**Começar HOJE:**
1. **P0-SAFETY (UX-D07)** — 1,75h, zero risco
2. **P0-DATA (TD-DAT-01/02)** — 2-3h, zero risco
3. **Git init** — 0,5h, unblocks everything

**Esta semana (Phase 1):**
- TypeCheck + ESLint + Test suite

**Próximas 2 semanas (Phase 2):**
- Refatoração de arquitetura

**Próximas 3-4 semanas (Phase 3):**
- A11y + Quality gates

**Meta realista:** Débito crítico resolvido em 8 semanas (~2 meses)

---

**Preparado por:** Orion (AIOX Master)  
**Data:** 2026-09-08  
**Status:** Ready for Execution  
**Aprovação necessária:** @pm (budget) + @dev (capacity)
