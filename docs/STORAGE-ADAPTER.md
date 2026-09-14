# StorageAdapter

## Finalidade

O sistema persiste o acompanhamento pedagogico sem banco de dados e sem `localStorage`/`sessionStorage`. O unico mecanismo de persistencia e o servico assincrono `window.storage` fornecido pelo ambiente hospedeiro.

O adapter canonico esta em `src/domain/storage/StorageAdapter.ts`.

## Chaves persistidas

- `operadores`: mapa de operadores com `best`, contadores, `stats` e `studyLog`.
- `partidas`: historico resumido das partidas finalizadas.

## Contrato do host

```ts
interface HostStorage {
  get(key: string, global: boolean): Promise<{ value?: string } | null>;
  set(key: string, value: string, global: boolean): Promise<boolean>;
}
```

Componentes React nao acessam o host diretamente. O `App` usa `storageAdapter.read` e `storageAdapter.write`.

## Envelope v1

Novas escritas usam:

```ts
{
  schemaVersion: 1,
  updatedAt: number,
  data: unknown
}
```

Leituras aceitam registros legados sem envelope e retornam somente o campo `data` quando encontram um envelope v1. Campos desconhecidos do registro legado sao preservados durante o merge.

## Saude e seguranca

O adapter informa `healthy`, `degraded` ou `unavailable`, registra a ultima operacao e mantem auditoria em memoria. Depois de falha de leitura ou indisponibilidade, escritas sao bloqueadas para evitar sobrescrita destrutiva.

Fallback em memoria nao e considerado persistencia. A UI pode continuar renderizando, mas deve exibir o erro de armazenamento.

## Fluxo de desempenho

1. `bump` registra cada resposta na sessao atual.
2. A sessao acumula `stats.tabs`, `stats.ops`, `stats.forms` e o dia local em `studyLog`.
3. `saveResult` consolida o operador ao vencer, perder ou abandonar.
4. A partida e adicionada ao historico `partidas`.
5. Pausar nao grava uma partida finalizada.

Uma partida encerrada antes de `saveResult` nao gera registro permanente, conforme o limite atual de `docs/estrutura-acompanhamento.md`.
