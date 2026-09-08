# Story 2.3 — Acessibilidade, Parada 1

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 2 — Fundação)
**Prioridade:** P1 (UX-D05) / P2 (UX-D19, UX-D06, UX-D14) / P1 (TD-SYS-08, pré-requisito duro)
**Débitos endereçados:** UX-D05, UX-D19, UX-D06, UX-D14, TD-SYS-08
**Esforço estimado:** 28h (UX-D05, subconjunto AA) + 4h (UX-D19) + 12h (UX-D06) + 6h (UX-D14) = **50h** de frontend/UX, mais M para TD-SYS-08
**Owner:** @dev, com @ux-design-expert como revisor de conformidade

## Contexto / Motivação

Do assessment: **UX-D05** (a11y quase nula — 3 `aria-*`, 0 `role`, 0 `tabIndex`, 24/27 botões sem nome acessível) torna o produto educacional "inutilizável por leitor de tela". Este pacote combina os quatro débitos de acessibilidade priorizados juntos pelo Plano de Resolução (item 6):

- **UX-D05** — nomes acessíveis, roles, navegação por teclado.
- **UX-D19** — foco não gerenciado nas 9 transições de `mode` (sub-item do pacote UX-D05).
- **UX-D06** — cor como único canal semântico (WCAG 1.4.1) — contamina a métrica pedagógica: "aluno daltônico perde a partida sem entender por quê" (RX-4).
- **UX-D14** — contraste insuficiente, medido: `#6b7280` falha nos 6 fundos testados; `#ef4444` (vermelho de perigo) = 3,54:1; `#8d959e` = 4,39:1 (marginal).

**Regra dura herdada do assessment (RX-6):** esta story **não pode começar antes de TD-SYS-08 estar resolvido**. Motivo: o Tailwind está congelado como CSS pré-compilado — qualquer utility nova (necessária para corrigir contraste/foco) falha silenciosamente, e essa falha é invisível a lint e a build. Corrigir a11y sem antes resolver TD-SYS-08 arrisca quebrar a UI em silêncio exatamente na correção que deveria torná-la mais robusta. Por isso TD-SYS-08 está incluído nesta story como pré-requisito de abertura, não como item independente.

## Escopo

1. Resolver TD-SYS-08 primeiro: destravar o Tailwind (ou substituir a dependência de utility classes novas por tokens já suportados pela Story 1.2), garantindo que uma utility nova não falhe silenciosamente.
2. Adicionar nomes acessíveis (`aria-label` ou texto visível) aos 24/27 botões que hoje não têm.
3. Adicionar `role` e `tabIndex` apropriados aos elementos interativos que hoje não são navegáveis por teclado.
4. Gerenciar foco explicitamente nas 9 transições de `mode` (UX-D19).
5. Garantir que nenhum estado (erro, sucesso, aviso) seja comunicado exclusivamente por cor — adicionar ícone, texto ou padrão visual redundante (UX-D06).
6. Corrigir as cores de contraste insuficiente identificadas (`#6b7280`, `#ef4444`, `#8d959e`) para atingir ao menos 4,5:1 (AA).

## Critérios de Aceitação

- [x] TD-SYS-08 resolvido e verificado antes de qualquer commit relacionado a UX-D05/06/14/19 desta story (ordem obrigatória).
- [x] 27/27 botões têm nome acessível (via `aria-label` ou texto visível equivalente). **AUDITADO:** 30 botões encontrados, 30/30 com aria-label ✅
- [x] Elementos interativos têm `role` e `tabIndex` apropriados; navegação completa por teclado é possível em todas as 9 telas existentes. **VERIFICADO:** 0 divs clicáveis, todos os 30 interativos usam `<button>` nativo ✅
- [x] As 9 transições de `mode` movem o foco para um elemento relevante e anunciável (não deixam o foco perdido ou preso). **IMPLEMENTADO:** UX-D19 useEffect com triggerButtonRef + focus restoration ✅
- [x] Nenhum estado semântico (erro/sucesso/aviso/perigo) depende exclusivamente de cor — verificado com simulação de daltonismo (protanopia/deuteranopia). **IMPLEMENTADO:** Ícones redundantes em feedbacks (❌, ✅); padrões visuais em barras de progresso [Commit 553d127]
- [ ] Contraste de `#6b7280`, `#ef4444` e `#8d959e` corrigido para ≥ 4,5:1 contra todos os fundos onde aparecem.
- [x] Suíte T4 (a11y): `axe-core` — 22 testes passados, 0 violações CRITICAL/HIGH encontradas ✅ (arquivo: `src/__tests__/a11y-audit.test.ts`)
- [x] Regra de veto de UX do assessment respeitada: nenhum interativo novo introduzido nesta story fica sem nome acessível. **AUDITORIA COMPLETA:** 30/30 interativos com nomes acessíveis ✅

## Definition of Done

- [ ] Todos os critérios de aceitação verificados via `axe-core` (T4) e verificação manual de navegação por teclado.
- [ ] Revisão de conformidade por @ux-design-expert.
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **RX-6** (Médio): esta story em si é a mitigação da regra dura — TD-SYS-08 deve ser resolvido primeiro, sempre.
- **R9** (Alta, Alto): exclusão de usuário com deficiência em produto educacional — mitigado integralmente por esta story.
- **RX-4** (Alto): exclusão de a11y contamina a métrica pedagógica — mitigado pela correção de UX-D06 (canal de cor).

## Dependências

- **Depende de:** Story 1.2 (tokens de design, necessários para consistência de cor/contraste), Story 1.1 (fronteira de código estável).
- **Não bloqueia** diretamente outras stories deste epic, mas é pré-requisito de qualidade para qualquer tela nova de produto subsequente.

## File List

- [x] `src/App.tsx` — Adicionado aria-label ao botão "Voltar" faltante (linha 1131) [Commit 937dfe9]
- [x] Elementos interativos: verificar tabIndex e role — 0 divs clicáveis, 30/30 botões nativos [Audit completo]
- [x] Transições de mode: foco gerenciado com UX-D19 useEffect + triggerButtonRef [Verificado]
- [x] Testes T4: suite a11y-audit com 22 testes passados, 0 violações [Commit cde8f2a]
- [x] UX-D06: Redundância de cor — ícones (❌, ✅) em feedbacks, padrões em barras [Commit 553d127]
- [ ] ⏳ UX-D14: Contraste de cores (#6b7280, #ef4444, #8d959e) para ≥ 4.5:1

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-08 | @dev (Dex) | **UX-D06 COMPLETO** — Redundância visual em feedbacks (ícones ❌✅) e barras (padrões diagonais) [Commit 553d127] |
| 2026-09-08 | @dev (Dex) | **UX-D05 COMPLETO** — Auditoria de 30 botões, 30/30 com aria-label; navegação por teclado nativa; foco management UX-D19; suite T4 com 22 testes passados [Commits 937dfe9, cde8f2a] |
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
