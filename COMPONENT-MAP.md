# App.tsx Component & Hook Extraction Map

**File:** `src/App.tsx` (1.457 lines)  
**Target:** <200 lines  
**Strategy:** Extract hooks + components incrementally

---

## 1. INLINE COMPONENTS (to extract)

### Mini-Components (10-20 lines each)
- **Boom** (already inline, ~40 lines) - Explosion animation on meltdown
- **getDeviceClass** (utility)
- **useDeviceClass** (hook - ~15 lines)
- **useViewportScale** (hook - ~15 lines)

### State-Heavy Functions (20-50 lines each)
- **bump** (questions scoring) — 15 lines
- **mergeStats** (statistics aggregation) — 8 lines
- **loadAll** (initialization) — 25 lines
- **persist** (save operators) — 20 lines
- **persistMatches** (save game records) — 20 lines
- **createPlayer** (new operator) — 6 lines
- **handleExcludeOperator** (delete operator) — 12 lines
- **saveResult** (end-of-game persistence) — 20 lines

### UI Render Blocks (100-200 lines each)
- **Login Mode Render** (login form) — ~80 lines
- **Menu Mode Render** (operator selection) — ~120 lines
- **Play Mode Render** (game board + physics) — ~500+ lines
- **Pause Mode Render** (pause menu) — ~60 lines
- **Analysis Mode Render** (performance charts) — ~300 lines

### Game Logic Functions (20-40 lines each)
- **makeOne** (generate question) — ~20 lines
- **build** (question pairs) — ~10 lines
- **newPair** (pair management) — ~10 lines
- **start** (game start) — ~10 lines
- **continueGame** (resume) — ~9 lines
- **pick** (user selects answer) — ~7 lines
- **check** (validate answer) — ~28 lines
- **press** (keyboard input) — ~9 lines
- **doVent** (emergency vent) — ~6 lines
- **doBoron** (emergency coolant) — ~9 lines
- **doScram** (emergency shutdown) — ~10 lines
- **pauseGame** (pause handler) — ~2 lines

### Audio/Render Utilities (15-30 lines each)
- **initA** (audio context init) — 1 line callback
- **tone** (audio synthesis) — ~9 lines
- **okSnd, errSnd, scrmSnd, boomSnd** (sound effects) — 1-5 lines each
- **startAlm, stopAlm** (alarm sounds) — 4-5 lines each
- **startGei, stopGei** (geiger sounds) — 4-5 lines each

---

## 2. STATE ORGANIZATION (to extract into hooks)

### usePhysicsEngine() — ~80 lines
**States:**
- `heat, setHeat`
- `integrity, setIntegrity`
- `coolant, setCoolant`
- `shownTemp, setShownTemp`
- `delta, setDelta`

**Effects & Logic:**
- Thermostat simulation
- Coolant injection effects
- Integrity decay
- Emergency vent/boron/scram timing

**Related functions:**
- `addHeat(v)`
- `doVent()`, `doBoron()`, `doScram()`

---

### useTurmaRegistry() — already imported!
**States:** (already extracted)
- `players, setPlayers`
- `player, setPlayer`
- `loading, setLoading`
- `storeErr, setStoreErr`

**Functions:**
- `loadAll()`, `persist()`, `persistMatches()`
- `createPlayer()`, `handleExcludeOperator()`
- `saveResult()`

**ALREADY IN:** `src/hooks/useTurmaRegistry.ts` ✅

---

### useGameState() — ~100 lines
**States:**
- `matches, setMatches`
- `tab, setTab`
- `nameInput, setNameInput`
- `rankIdx, setRankIdx`
- `pair, setPair`
- `picked, setPicked`
- `grace, setGrace`
- `ans, setAns`
- `tmr, setTmr` (timer)
- `scrm, setScrm` (scram charges)
- `ventCd, setVentCd` (vent cooldown)
- `boronCd, setBoronCd` (boron cooldown)
- `frozen, setFrozen`
- `tot, setTot` (total questions)
- `corr, setCorr` (correct)
- `elapsed, setElapsed` (game time)
- `fb, setFb` (feedback)
- `evt, setEvt` (current event)
- `melt, setMelt` (meltdown indicator)

**Functions:**
- `makeOne()`, `build()`, `newPair()`
- `pick()`, `check()`
- `press()` (keyboard input handler)
- `startGame()`, `continueGame()`

**Refs to preserve:**
- `roundNo`, `recent`, `saved`, `sess`

---

### useUIState() — ~60 lines
**States:**
- `mode, setMode` (login|menu|play|pause|analise)
- `boom, setBoom` (explosion)
- `snd, setSnd` (sound toggle)
- `diff, setDiff` (difficulty)
- `selectedOperatorToExclude`
- `calendarCursor, setCalendarCursor`

**Effects:**
- Mode transition & focus management
- Window resize listeners

**Functions:**
- `pauseGame()`

---

### useScoreBoard() — ~30 lines
**States:**
- `pts, setPts`
- `goal, setGoal`
- `strk, setStrk` (current streak)
- `bestStrk, setBestStrk` (best streak)

**Already extracted to:** `src/hooks/useScore.ts` ✅

---

### usePhysicsCalculations() — ~40 lines
**Already imported from:** `src/hooks/usePhysics.ts` ✅

**Provides:**
- `heat, setHeat, integrity, setIntegrity, coolant, setCoolant, shownTemp, setShownTemp, delta, setDelta`

---

### useAudio() — ~50 lines
**States:**
- `snd, setSnd` (sound enabled)
- Refs: `ctx, alm, gei`

**Functions:**
- `initA()`
- `tone()`
- `okSnd()`, `errSnd()`, `scrmSnd()`, `boomSnd()`
- `startAlm()`, `stopAlm()`
- `startGei()`, `stopGei()`

---

## 3. COMPONENT RENDER SECTIONS (to extract)

### Login Mode (60-80 lines) → LoginPanel.tsx
- Player name input
- Create player button
- Store error message

### Menu Mode (100-150 lines) → MenuPanel.tsx
- Operator list (table/cards)
- Difficulty selector
- "Play" button
- "Analysis" link

### Game Mode (300-400 lines) → GameBoard.tsx
- Physics display (reactor state, temperature gauge)
- Question display
- Answer options (buttons)
- Keyboard input handling
- Emergency controls (Vent, Boron, Scram)
- Game timer

### Sub-components within GameBoard:
- **ReactorCore.tsx** (~80 lines) - Core display + gauges
- **ControlPanel.tsx** (~60 lines) - Emergency buttons
- **QuestionPanel.tsx** (~40 lines) - Question & options
- **PerformanceBar.tsx** (~20 lines) - Score display

### Pause Mode (40-60 lines) → PausePanel.tsx
- "Resume" button
- "Menu" button
- Stats snapshot

### Analysis Mode (200-300 lines) → AnalysisPanel.tsx
- Calendar heatmap
- Priority study list
- Table accuracy map
- Operation type breakdown
- Statistics charts

### Sub-components within AnalysisPanel:
- **CalendarHeatmap.tsx** (~60 lines)
- **PriorityList.tsx** (~40 lines)
- **TableAccuracyMap.tsx** (~50 lines)
- **StatsCharts.tsx** (~80 lines)

---

## 4. EXTRACTION ORDER (dependency-safe)

**Phase A: Extract Hooks (no components needed)**
1. Create `useUIState()` — UI mode + focus + calendar
2. Create `useGameState()` — all game logic states
3. Create `useAudio()` — audio synthesis + sounds

**Phase B: Extract Base Components (leaf → root)**
4. Extract **PerformanceBar.tsx** (simple display)
5. Extract **QuestionPanel.tsx** (display + input handler)
6. Extract **ControlPanel.tsx** (buttons)
7. Extract **ReactorCore.tsx** (gauges + visualization)
8. Extract **GameBoard.tsx** (orchestrates game components)
9. Extract **LoginPanel.tsx** (form)
10. Extract **MenuPanel.tsx** (operator selection)
11. Extract **PausePanel.tsx** (pause UI)
12. Extract **CalendarHeatmap.tsx** (sub-component)
13. Extract **PriorityList.tsx** (sub-component)
14. Extract **TableAccuracyMap.tsx** (sub-component)
15. Extract **StatsCharts.tsx** (sub-component)
16. Extract **AnalysisPanel.tsx** (orchestrates analysis components)

**Phase C: Refactor App.tsx**
17. Replace all inline logic with hook calls
18. Replace all render blocks with component calls
19. Verify App.tsx <200 lines
20. Run tests (npm test)
21. Commit: `refactor: decompose App.tsx [TD-SYS-05][TD-SYS-06]`

---

## 5. NEW STRUCTURE (after extraction)

```
src/
├── App.tsx (~150 lines)
│   ├── useUIState()
│   ├── useGameState()
│   ├── useAudio()
│   ├── useTurmaRegistry() [imported]
│   ├── usePhysics() [imported]
│   ├── useScore() [imported]
│   └── Render: 6 mode branches
│       ├── if (mode === 'login') <LoginPanel />
│       ├── if (mode === 'menu') <MenuPanel />
│       ├── if (mode === 'play') <GameBoard />
│       ├── if (mode === 'pause') <PausePanel />
│       ├── if (mode === 'analise') <AnalysisPanel />
│       └── if (boom) <Boom />
├── components/
│   ├── GameBoard.tsx
│   │   ├── ReactorCore.tsx
│   │   ├── ControlPanel.tsx
│   │   └── QuestionPanel.tsx
│   │       ├── PerformanceBar.tsx
│   ├── LoginPanel.tsx
│   ├── MenuPanel.tsx
│   ├── PausePanel.tsx
│   └── AnalysisPanel.tsx
│       ├── CalendarHeatmap.tsx
│       ├── PriorityList.tsx
│       ├── TableAccuracyMap.tsx
│       └── StatsCharts.tsx
├── hooks/
│   ├── useUIState.ts (NEW)
│   ├── useGameState.ts (NEW)
│   ├── useAudio.ts (NEW)
│   ├── useTurmaRegistry.ts (existing ✅)
│   ├── usePhysics.ts (existing ✅)
│   └── useScore.ts (existing ✅)
└── styles/
    ├── index.css (existing)
    └── tokens.css (existing)
```

---

## 6. CONSTANTS & CONFIG (to organize)

Move to `src/domain/config/index.ts`:
- `DIFF` (difficulty levels)
- `TITLES` (rank titles)
- `CHART_COLORS` (recharts colors)
- `DS` (design system: shadows, gradients)
- `axisStyle`, `tipStyle` (chart styling)
- `VENT_CD`, `BORON_CD`, `FREEZE_MS` (game constants)
- `FORM` (question form labels)

Move to `src/styles/`:
- Inline gradient definitions
- CSS classes used in renders

---

## Success Criteria

✅ App.tsx <200 lines
✅ 3 new hooks created (useUIState, useGameState, useAudio)
✅ 8-12 components extracted
✅ All imports updated
✅ `npm test` — 100% passing
✅ No visual regressions
✅ Commit ready for Phase 3 → A11y

---

**Created:** 2026-09-08  
**By:** @dev (Dex)  
**For:** Phase 2 Decomposition Sprint
