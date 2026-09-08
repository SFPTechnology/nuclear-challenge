export interface StudyDay {
  key: string;
  year: number;
  month: number;
  day: number;
  weekday: number;
  total: number;
  hits: number;
  misses: number;
  types: {
    multiplication: { hits: number; misses: number };
    division: { hits: number; misses: number };
    direct: { hits: number; misses: number };
    inverse: { hits: number; misses: number };
  };
  tables: Record<string, { hits: number; misses: number }>;
  updatedAt: number;
}

export const emptyStudyDay = (day: any): StudyDay => ({
  ...day,
  total: 0,
  hits: 0,
  misses: 0,
  types: {
    multiplication: { hits: 0, misses: 0 },
    division: { hits: 0, misses: 0 },
    direct: { hits: 0, misses: 0 },
    inverse: { hits: 0, misses: 0 },
  },
  tables: {},
  updatedAt: Date.now(),
});

export const mergeStudyLog = (
  old: Record<string, StudyDay> = {},
  add: Record<string, StudyDay> = {}
): Record<string, StudyDay> => {
  const out: Record<string, StudyDay> = { ...old };

  Object.entries(add).forEach(([key, value]) => {
    const day = out[key] || emptyStudyDay(value);
    const next: StudyDay = {
      ...day,
      total: day.total + value.total,
      hits: day.hits + value.hits,
      misses: day.misses + value.misses,
      updatedAt: Date.now(),
      types: { ...day.types },
      tables: { ...day.tables },
    };

    Object.entries(value.types).forEach(([type, counts]) => {
      const previous = next.types[type as keyof typeof next.types] || {
        hits: 0,
        misses: 0,
      };
      (next.types[type as keyof typeof next.types] as any) = {
        hits: previous.hits + counts.hits,
        misses: previous.misses + counts.misses,
      };
    });

    Object.entries(value.tables).forEach(([table, counts]) => {
      const previous = next.tables[table] || { hits: 0, misses: 0 };
      next.tables[table] = {
        hits: previous.hits + counts.hits,
        misses: previous.misses + counts.misses,
      };
    });

    out[key] = next;
  });

  return out;
};
