# Story 1.2 — Design tokens e tipografia acessível

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 1 — Quick Wins)
**Prioridade:** P1
**Débitos endereçados:** UX-D02, UX-D23
**Esforço estimado:** 24h (UX-D02) + 10h (UX-D23) = **34h**
**Owner:** @dev (com @ux-design-expert como revisor de conformidade)

## Contexto / Motivação

Do assessment (`ux-specialist-review.md` via `technical-debt-assessment.md` §Inventário Frontend/UX):

- **UX-D02** — design system inexistente: 168 blocos `style={{}}` versus 227 `className`, cores literais espalhadas pelo código. Rebaixada de CRÍTICA para ALTA na Fase 6 porque não bloqueia nenhuma story de produto, mas garante degradação visual progressiva conforme o produto cresce (R4).
- **UX-D23** — 100 ocorrências de `fontSize` numérico em px, zero uso de `rem`/`em`. Classificado como "a falha de a11y mais completa do produto, sem caminho de contorno" — usuários que ajustam o zoom do navegador/sistema não conseguem redimensionar texto.

O assessment (Plano de Resolução, item 1) agrupa estes dois débitos como "entrega única": tokens de design e conversão de unidades tipográficas devem ser resolvidos juntos porque tocam a mesma superfície de código (estilos inline).

**Invariante de UI que restringe a remediação (não é um débito, é uma restrição herdada do assessment):** "Valores arbitrários do Tailwind não funcionam — `style` inline é solução deliberada; a remediação de UX-D02 é fazer o inline ler de tokens, não eliminá-lo." Ou seja: esta story **não** deve migrar todo `style={{}}` para classes Tailwind — deve fazer os valores inline referenciarem uma fonte única de tokens (cores, espaçamento, tipografia).

Esta story é pré-requisito de:
- **Story 2.3** (a11y Parada 1) — que depende de tokens de cor consistentes para corrigir contraste (UX-D14) e canal de cor (UX-D06).
- **Story 2.4** (empty states / error boundary) — que precisa de tokens para manter consistência visual.
- **Story 1.1** deve preceder esta story (estrutura `src/` estável antes de introduzir um módulo de tokens).

## Escopo

1. Criar um módulo de tokens de design (cores, espaçamento, tipografia, radii) como fonte única de verdade, consumido pelos blocos `style={{}}` existentes (não eliminá-los — fazê-los ler de tokens).
2. Substituir as 100 ocorrências de `fontSize` numérico em px por `rem`/`em`, calculado a partir de um root font-size documentado.
3. Documentar o mapeamento de cores literais → tokens semânticos (ex.: `#ef4444` → `token.color.danger`), preparando terreno para a correção de contraste da Story 2.3.

## Critérios de Aceitação

- [ ] Existe um módulo único de tokens de design, importado por todos os componentes que hoje usam `style={{}}`.
- [ ] Nenhum `fontSize` numérico em px permanece no código — as 100 ocorrências (recontadas em 100 pelo `@qa`, corrigindo a medição original de Uma em 93) estão convertidas para `rem`/`em`.
- [ ] Zoom do navegador (100%, 150%, 200%) redimensiona corretamente o texto (verificação manual, T4 automatizada chega na Story 2.3).
- [ ] Cores literais usadas em mais de um lugar são substituídas por tokens semânticos nomeados.
- [ ] `style={{}}` inline permanece como mecanismo (não é eliminado), mas passa a ler valores de tokens, não de literais hardcoded — respeitando a invariante do assessment.
- [ ] Nenhuma regressão visual perceptível nas telas existentes (verificação manual comparando screenshots antes/depois).

## Definition of Done

- [ ] Módulo de tokens criado e documentado (mínimo: cores, tipografia, espaçamento).
- [ ] As 100 ocorrências de `fontSize` px convertidas.
- [ ] Revisão de conformidade por @ux-design-expert confirmando que a remediação segue a invariante "inline lê de tokens, não é eliminado".
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R4** (do assessment): UI quebrada em silêncio por utility Tailwind ausente — mitigado por esta story preceder qualquer nova UI (Story 2.2, 2.3, 2.4).
- Risco de escopo: é tentador, ao criar tokens, migrar tudo para Tailwind — isso violaria a invariante do assessment e deve ser evitado.

## Dependências

- **Depende de:** Story 1.1 (estrutura `src/` estável).
- **Bloqueia:** Story 2.3 (a11y Parada 1 — contraste e canal de cor), Story 2.4 (empty states).

## File List

- [ ] A definir durante a implementação (módulo de tokens, componentes com `fontSize` convertido).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
