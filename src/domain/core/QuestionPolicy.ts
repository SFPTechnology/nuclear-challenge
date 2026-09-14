export type QuestionRange = [number, number];

export const LEVEL_QUESTION_RANGES: Record<number, {
  routine: QuestionRange;
  priority: QuestionRange;
}> = {
  1: { routine: [2, 7], priority: [6, 10] },
  2: { routine: [3, 7], priority: [6, 10] },
  3: { routine: [4, 8], priority: [7, 10] },
  4: { routine: [5, 8], priority: [7, 12] },
  5: { routine: [6, 11], priority: [8, 15] },
};

/** Every second generated pair reinforces the routine with the high range. */
export const ROUTINE_REINFORCEMENT_INTERVAL = 2;

/** The existing 1,000-point level target represents 50% fewer accounts. */
export const LEVEL_GOAL_POINTS = 1500;

export type QuestionProfile = 'routine' | 'priority';
export type QuestionSymbol = '×' | '÷';
export type HiddenOperand = 'result' | 'left' | 'right';

export interface QuestionCandidate {
  profile: QuestionProfile;
  surge: boolean;
  prompt: string;
  key: string;
  answer: number;
  full: string;
  sym: QuestionSymbol;
  hidden: HiddenOperand;
  factors: number[];
}

/**
 * Enumerates every distinct question that can be shown by a profile. The
 * caller consumes this list as a shuffled deck, so a question cannot repeat
 * until that profile/range deck is exhausted.
 */
export function buildQuestionCandidates(
  level: number,
  operations: readonly ('*' | '/')[],
  profile: QuestionProfile,
  surge = false,
): QuestionCandidate[] {
  const [min, max] = profile === 'priority' || surge
    ? LEVEL_QUESTION_RANGES[level].priority
    : LEVEL_QUESTION_RANGES[level].routine;
  const hiddenSlots: HiddenOperand[] = level <= 2
    ? ['result']
    : profile === 'routine'
      ? ['result', 'right']
      : ['result', 'left', 'right'];
  const candidates: QuestionCandidate[] = [];

  operations.forEach((operation) => {
    for (let first = min; first <= max; first += 1) {
      for (let second = min; second <= max; second += 1) {
        const sym: QuestionSymbol = operation === '*' ? '×' : '÷';
        const a = operation === '*' ? first : first * second;
        const b = operation === '*' ? second : first;
        const result = operation === '*' ? first * second : second;

        hiddenSlots.forEach((hidden) => {
          const prompt = hidden === 'result'
            ? `${a} ${sym} ${b} = ?`
            : hidden === 'left'
              ? `? ${sym} ${b} = ${result}`
              : `${a} ${sym} ? = ${result}`;
          candidates.push({
            profile,
            surge,
            prompt,
            key: `${a}${sym}${b}${hidden}`,
            answer: hidden === 'result' ? result : hidden === 'left' ? a : b,
            full: `${a} ${sym} ${b} = ${result}`,
            sym,
            hidden,
            factors: sym === '×' ? [a, b] : [b, result],
          });
        });
      }
    }
  });

  return candidates;
}

/** Identity of an account regardless of which operand is hidden ("5 × 6"). */
export function questionFactKey(question: Pick<QuestionCandidate, 'full'>): string {
  return question.full.split(' = ')[0];
}

/**
 * Picks the next question so that an account (fact) only repeats after every
 * account available to the candidate list was shown. `seen` is shared across
 * profiles, levels and sessions, so overlapping ranges do not bypass the cycle.
 * Only the facts of the current candidate list are recycled once exhausted.
 */
export function pickQuestion<T extends QuestionCandidate>(
  candidates: readonly T[],
  seen: Set<string>,
  avoid: readonly string[] = [],
  random: () => number = Math.random,
  reinforce?: Set<string>,
): T {
  const byFact = new Map<string, T[]>();
  candidates.forEach((candidate) => {
    const fact = questionFactKey(candidate);
    byFact.set(fact, [...(byFact.get(fact) ?? []), candidate]);
  });

  // Exception to the cycle: an account answered incorrectly returns in the
  // next round for reinforcement, even if it was already shown in this cycle.
  const pending = reinforce
    ? [...reinforce].find(fact => byFact.has(fact) && !avoid.includes(fact))
    : undefined;
  if (pending) {
    reinforce!.delete(pending);
    touch(seen, pending);
    const variants = byFact.get(pending)!;
    return variants[Math.floor(random() * variants.length)];
  }

  // `seen` keeps insertion order: a fact counts as shown for this list when it
  // sits after the list's cycle marker. Recycling only moves the marker, so a
  // list restarting never re-exposes shared facts to another list mid-cycle.
  const marker = cycleMarker(byFact.keys());
  const position = new Map([...seen].map((entry, index) => [entry, index]));
  const start = position.get(marker) ?? -1;
  let facts = [...byFact.keys()].filter(fact => (position.get(fact) ?? -1) <= start);
  if (facts.length === 0) {
    touch(seen, marker);
    facts = [...byFact.keys()];
  }
  const preferred = facts.filter(fact => !avoid.includes(fact));
  if (preferred.length > 0) facts = preferred;

  const fact = facts[Math.floor(random() * facts.length)];
  const variants = byFact.get(fact)!;
  touch(seen, fact);
  return variants[Math.floor(random() * variants.length)];
}

/** Moves an entry to the end of the set's insertion order. */
function touch(set: Set<string>, entry: string): void {
  set.delete(entry);
  set.add(entry);
}

/** Stable cycle marker for a candidate list, derived from its facts. */
function cycleMarker(facts: Iterable<string>): string {
  let hash = 5381;
  for (const char of [...facts].sort().join('|')) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return `cycle:${hash.toString(36)}`;
}

export type FactSetKind = 'seen' | 'reinforce';

const storageKey = (kind: FactSetKind, ownerId: string) => `nuclear:question-${kind}:${ownerId}`;

export function loadSeenFacts(ownerId: string | undefined, kind: FactSetKind = 'seen'): Set<string> {
  if (!ownerId) return new Set();
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(kind, ownerId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveSeenFacts(ownerId: string | undefined, seen: Set<string>, kind: FactSetKind = 'seen'): void {
  if (!ownerId) return;
  try {
    globalThis.localStorage?.setItem(storageKey(kind, ownerId), JSON.stringify([...seen]));
  } catch {
    // Storage unavailable: the cycle still holds for the current session.
  }
}

export function shuffledQuestionCycle<T>(items: readonly T[]): T[] {
  const cycle = [...items];
  for (let index = cycle.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cycle[index], cycle[swapIndex]] = [cycle[swapIndex], cycle[index]];
  }
  return cycle;
}
