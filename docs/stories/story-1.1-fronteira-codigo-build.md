# Story 1.1 — Fronteira de código, build e higiene de configuração

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 1 — Quick Wins)
**Prioridade:** P0 / P1 / P2
**Débitos endereçados:** TD-SYS-05, TD-SYS-11, TD-SYS-17, TD-SYS-10 (fecho documental)
**Esforço estimado:** M (TD-SYS-05) + S (TD-SYS-11) + S/~0,25h (TD-SYS-17) + S (fecho documental)
**Owner:** @dev (código), @pm (fecho documental de TD-SYS-10)

## Contexto / Motivação

Do assessment (`technical-debt-assessment.md`, Plano de Resolução, item 2): a inversão de fronteira de código é a **causa raiz mecânica** de dois outros débitos (TD-SYS-02 e TD-SYS-16, já corrigidos parcialmente na Story 0.1) — a aplicação inteira reside em `Arquivos_Diversos/` em vez de uma estrutura `src/` convencional. Isso bloqueia mecanicamente qualquer configuração de lint/build/alias que dependa de convenção de diretório, incluindo o Artigo VI da Constitution (Absolute Imports), hoje inaplicável por ausência de `vite.config.*` e plugin React (TD-SYS-11).

Esta story é raiz de dependência: a Story 1.2 (design tokens), 1.3 (qualidade) e todas as stories de Fase 2 dependem de uma estrutura de projeto estável antes de poder configurar lint, alias e build corretamente.

Adicionalmente, dois débitos isolados e de baixo esforço, sem dependência técnica, são resolvidos no mesmo momento por eficiência (não é retrabalho revisitar a mesma configuração depois):

- **TD-SYS-17** — `SUPABASE_SERVICE_ROLE_KEY` presente em `.env` de projeto Vite client-side, aumentando a superfície de exfiltração de credencial (RX-8). Remoção das 3 chaves não consumidas custa ~0,25h e não tem dependência técnica.
- **TD-SYS-10** — o bloqueio registrado para NC-001/002/003 cita um motivo obsoleto. O assessment determina que essa correção é "sinalização documental, não trabalho de código — atualizada assim que a story de fundação existir". Esta é a primeira story de fundação do epic; o fecho aqui atualiza o motivo real do bloqueio (camada de domínio ausente — TD-SYS-07; estrutura de dados de histórico ausente — TD-DAT-03; violação de NC-003 AC-2 — TD-DAT-01).

## Escopo

1. Mover todo o código de aplicação de `Arquivos_Diversos/` para uma estrutura `src/` convencional (TD-SYS-05).
2. Criar `vite.config.*` com plugin React e aliases de import absoluto, habilitando conformidade com o Artigo VI da Constitution (TD-SYS-11).
3. Remover do `.env` as 3 chaves não consumidas, incluindo `SUPABASE_SERVICE_ROLE_KEY` (TD-SYS-17).
4. Atualizar o texto de bloqueio de NC-001, NC-002 e NC-003 (`Status: Blocked`) para citar os motivos reais e atuais: TD-SYS-07 (sem camada de domínio → contratos CLI impossíveis), TD-DAT-03 (`partidas` não é histórico, é top-40 global) e TD-DAT-01 (violação de NC-003 AC-2 no código atual) — fecho de TD-SYS-10.

## Critérios de Aceitação

- [ ] Todo o código de aplicação está sob `src/`, sem referências residuais a `Arquivos_Diversos/`.
- [ ] `vite.config.*` existe, com plugin React configurado e pelo menos um alias de import absoluto funcional (ex.: `@/` apontando para `src/`).
- [ ] Nenhum import relativo do tipo `../Arquivos_Diversos/...` permanece no código.
- [ ] `.env` não contém `SUPABASE_SERVICE_ROLE_KEY` nem as demais 2 chaves não consumidas.
- [ ] O texto de bloqueio (`Status: Blocked`) de NC-001, NC-002 e NC-003 é atualizado, citando os IDs de débito reais (TD-SYS-07, TD-DAT-03, TD-DAT-01) em vez do motivo obsoleto anterior.
- [ ] Build (`npm run build`) continua funcional após a movimentação de diretório.
- [ ] Nenhuma funcionalidade existente regride (verificação manual — toolchain de teste real ainda não existe nesta fase, chega na Story 1.3).

## Definition of Done

- [ ] Estrutura `src/` estabelecida e commitada.
- [ ] `vite.config.*` funcional, validado com `npm run build` e `npm run dev`.
- [ ] `.env` higienizado.
- [ ] Stories NC-001/002/003 com bloqueio atualizado (edição feita por @po, que é quem detém autoridade sobre o texto/escopo dessas stories — @dev sinaliza a necessidade, @po aplica a mudança).
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R3** (do assessment): ondas 1-3 bloqueadas por impossibilidade estrutural, com bloqueio apontando motivo errado — esta story corrige a causa raiz mecânica (TD-SYS-05) e o motivo documentado (TD-SYS-10) simultaneamente.
- **R6**: exposição de credencial com bypass de RLS se Supabase for integrado seguindo o `.env` existente — mitigado pela remoção de TD-SYS-17.
- Risco de execução: mover diretórios em massa sem Git ativo seria irreversível — por isso esta story depende obrigatoriamente da Story 0.1 (Git já inicializado).

## Dependências

- **Depende de:** Story 0.1 (Git deve existir antes de qualquer reorganização de diretório).
- **Bloqueia:** Story 1.2, Story 1.3, e todas as stories de Fase 2 (nenhuma depende diretamente de TD-SYS-05, mas todas assumem uma estrutura `src/` estável).

## File List

- [ ] A definir durante a implementação (estrutura de diretórios, `vite.config.*`, `.env`, stories NC-001/002/003).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
