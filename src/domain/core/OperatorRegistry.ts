export interface Operator {
  id: string;
  name: string;  // Display only (pseudonym key is UUID)
  email?: string;
  createdAt: number;
}

export class OperatorRegistry {
  private operators: Map<string, Operator> = new Map();

  register(operator: Operator): void {
    if (this.operators.has(operator.id)) {
      throw new Error(`Operator ${operator.id} already registered`);
    }
    this.operators.set(operator.id, operator);
  }

  unregister(id: string): void {
    this.operators.delete(id);
  }

  get(id: string): Operator | undefined {
    return this.operators.get(id);
  }

  list(): Operator[] {
    return Array.from(this.operators.values());
  }

  clear(): void {
    this.operators.clear();
  }
}

export function createRegistry(): OperatorRegistry {
  return new OperatorRegistry();
}
