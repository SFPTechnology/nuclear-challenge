# MetricBadge — Primitiva de Exibição de Métricas

**Componente:** `src/components/MetricBadge.tsx`  
**Versão:** 1.0  
**Status:** ✅ Ready for reuse  
**Débito técnico:** UX-D16 (parcial — primitiva implementada)

---

## Propósito

`MetricBadge` é uma primitiva reutilizável para exibição de métricas com status visual (ok, warning, alert). Segue design tokens definidos na Story 1.2 e é acessível via ARIA labels.

## API

```typescript
interface MetricBadgeProps {
  label: string;              // Ex: "Heat", "Integrity", "Coolant"
  value: number;              // Valor em 0-100%
  status: 'ok' | 'warning' | 'alert';
  showIcon?: boolean;         // Default: true
}
```

## Exemplo de Uso

```typescript
import { MetricBadge } from '@components/MetricBadge';

export function MyComponent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <MetricBadge
        label="Heat"
        value={heat}
        status={heat > 70 ? 'alert' : heat > 50 ? 'warning' : 'ok'}
      />
      <MetricBadge
        label="Integrity"
        value={integrity}
        status={integrity < 30 ? 'alert' : integrity < 60 ? 'warning' : 'ok'}
        showIcon={false}
      />
    </div>
  );
}
```

## Design Tokens Consumidos

| Status | Cor de Fundo | Cor de Texto | Ícone |
|--------|-------------|-------------|-------|
| `ok` | `#dcfce7` (verde claro) | `#166534` (verde escuro) | ✅ |
| `warning` | `#fef3c7` (amarelo claro) | `#92400e` (marrom) | ⚠️ |
| `alert` | `#fee2e2` (vermelho claro) | `#991b1b` (vermelho escuro) | 🔴 |

## Acessibilidade

- **aria-label:** Combina label, valor e status: `"Heat: 75% alert"`
- **role:** `status` — identifica como região de status em tela
- **Texto visível:** Sempre presente (sem depender apenas de ícone)
- **Contraste:** ✅ Todos os pares cor de fundo/texto atendem WCAG AA

## Requisitos Atendidos

✅ Primitiva reutilizável  
✅ Consumindo tokens de design (Story 1.2)  
✅ Acessível (aria-label + role)  
✅ Testável isoladamente  
✅ Sem dependências externas (além de React)

## Cenários de Uso

1. **Painel de Métricas de Reator** (uso atual em Phase 5)
2. **Dashboard de Operadores** (NC-003 futura)
3. **Histórico de Desempenho** (relatório pedagógico)
4. **Rankings** (ordenação por métrica)

## Notas

- Ícones usam emoji (sem SVG) para máxima compatibilidade
- Espaçamento e padding seguem escala de design tokens
- Funciona com valores 0-100% (fácil adaptar para outras escalas se necessário)

---

*Documentação criada: 2026-09-07*  
*Parte de: Story 2.2 — NC-003 piloto, MetricBadge e exclusão de dados do operador*
