# Runbook Supabase

## Validação remota sem Docker

A aplicação usa o projeto Supabase remoto. Docker Desktop não é requisito para conectar, executar migrations já publicadas nem validar o schema remoto. Com o projeto vinculado pela CLI, execute:

```powershell
supabase migration list --linked
supabase db lint --linked
```

Os comandos confirmam que as migrations locais e remotas estão sincronizadas e que o schema remoto não possui erros. O seed continua sintético e não deve ser aplicado em produção.

`supabase db reset` e `supabase test db` são recursos opcionais para uma instância isolada de desenvolvimento; eles podem usar Docker, mas não bloqueiam a operação do banco remoto.

## Dry-run legado

Execute `node scripts/migrate-legacy.mjs caminho/snapshot.json --dry-run`. O comando emite apenas versão, hash e contagens; não conecta ao banco, não escreve dados e não imprime nomes.

## Cutover

O cutover está bloqueado até D1–D6 serem aprovadas. Depois disso, o migrador deve inserir cada lote em transação, gravar `legacy_migration_audit`, reconciliar contagens e aguardar aprovação humana. Não migrar dados reais neste estágio.

## Incidente e rollback

Revogue chaves comprometidas, preserve os logs administrativos e restaure o snapshot/backup aprovado. Não executar `DROP` manualmente em produção. A exclusão de um operador usa a FK `on delete cascade`, após confirmação do procedimento de privacidade D3.
