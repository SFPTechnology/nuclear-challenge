# Story 2.5 — Decisão T5.1: viabilidade de histórico para NC-002

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação, execução paralela)
**Prioridade:** P1
**Débitos endereçados:** TD-DAT-03
**Esforço estimado:** M
**Owner:** @dev + @qa (execução do teste); decisão de escopo revisada por @pm

## Contexto / Motivação

Do assessment (§Inventário Dados/Testes, TD-DAT-03; §Critérios de Sucesso, T5.1):

> "`partidas` é top-40 global por pontuação, não histórico — não é longitudinal, é enviesado por sobrevivência, é multi-operador. NC-002 AC-2 infactível como escrito."

O assessment já decidiu o mecanismo de resolução: **T5.1** — um teste que roda um relatório longitudinal com 60 partidas de baixa pontuação vs. 40 de alta pontuação de outros operadores. Se o conjunto de dados resultante for vazio ou não representativo, o escopo de NC-002 migra de `matches` (a estrutura atual) para `studyLog` (estrutura ainda a definir, mais adequada a um histórico real).

Esta story é **paralela** ao restante da sequência 0-9 do Plano de Resolução — não depende de TD-SYS-05, TD-SYS-06, TD-SYS-07 ou TD-SYS-09. Depende apenas de:
1. Git ativo (Story 0.1).
2. Toolchain de teste real (TD-QA-01, entregue na Story 1.3), já que T5.1 é um teste executável, não uma análise manual.

O assessment é explícito: **"Roda antes da Fase 10"** — ou seja, esta decisão precisa estar resolvida antes de qualquer replanejamento de sprint que envolva NC-002, para não comprometer a funcionalidade pedagógica planejada (RX-3).

## Escopo

1. Implementar o teste T5.1: gerar (ou usar dados existentes, se disponíveis) um conjunto de 60 partidas de baixa pontuação e 40 de alta pontuação de operadores distintos.
2. Rodar o relatório longitudinal proposto por NC-002 AC-2 contra esse conjunto, usando a estrutura `matches` atual.
3. Registrar o resultado: se o relatório é factível com `matches`, documentar a decisão e encerrar a story. Se o conjunto resultante é vazio/não representativo, registrar a recomendação formal de migração de escopo para `studyLog`, incluindo o impacto estimado em NC-002.

## Critérios de Aceitação

- [ ] Teste T5.1 implementado e executável via a toolchain da Story 1.3.
- [ ] Resultado do teste documentado nesta story (seção "Resultado T5.1" a ser preenchida na execução).
- [ ] Decisão formal registrada: `matches` é viável para NC-002 AC-2 **ou** migração para `studyLog` é recomendada.
- [ ] Caso a migração seja recomendada, a story NC-002 (`docs/stories/NC-002-relatorio-pedagogico.md`) é atualizada por @po para refletir o novo requisito de estrutura de dados, citando TD-DAT-03 e esta story como origem da mudança.
- [ ] Esta story está concluída antes do início de qualquer replanejamento de sprint que inclua NC-002.

## Definition of Done

- [ ] T5.1 executado e resultado documentado.
- [ ] Decisão comunicada a @po e, se aplicável, story NC-002 atualizada.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **RX-3** (Alto): o próprio épico de produto planeja stories estruturalmente impossíveis com os dados atuais — esta story é a mitigação direta, decidindo o fato antes que o replanejamento de sprint assuma um pressuposto errado.

## Dependências

- **Depende de:** Story 0.1 (Git), Story 1.3 (toolchain de teste — TD-QA-01).
- **Não bloqueia** nenhuma outra story deste epic, mas bloqueia o replanejamento de NC-002 (fora deste epic).

## File List

- [ ] A definir durante a implementação (script/teste T5.1, resultado documentado).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
