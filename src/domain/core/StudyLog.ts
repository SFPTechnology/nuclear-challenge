export interface DayRecord {
  date: string; // YYYY-MM-DD
  phaseCount: number;
  bestScore: number;
  totalTime: number; // seconds
}

export class StudyLog {
  private days: Map<string, DayRecord> = new Map();

  recordDay(date: string, record: DayRecord): void {
    this.days.set(date, record);
  }

  getDay(date: string): DayRecord | undefined {
    return this.days.get(date);
  }

  // Additive merge (never destroys prior days)
  mergeLog(otherLog: StudyLog): void {
    for (const [date, record] of otherLog.days) {
      if (!this.days.has(date)) {
        this.days.set(date, record); // Only add new dates
      }
    }
  }

  list(startDate?: string, endDate?: string): DayRecord[] {
    return Array.from(this.days.values())
      .filter(r => {
        if (startDate && r.date < startDate) return false;
        if (endDate && r.date > endDate) return false;
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export function createStudyLog(): StudyLog {
  return new StudyLog();
}
