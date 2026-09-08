# Story 3.2 — Pseudonimização, refluxo responsivo e higiene final (P3)

Status: Draft

**Epic:** `docs/stories/epic-technical-debt.md` (Fase 3 — Otimização)
**Prioridade:** P2 (TD-DAT-04, UX-D11) / P3 (demais itens)
**Débitos endereçados:** TD-DAT-04, UX-D11, UX-D22, TD-SYS-12, TD-SYS-13, TD-SYS-14, TD-SYS-15, TD-SYS-21, TD-SYS-22, TD-SYS-23, UX-D08, UX-D15, UX-D17, UX-D18, UX-D25
**Esforço estimado:** M (TD-DAT-04) + 16h (UX-D11) + 3h (UX-D22) + M (TD-SYS-12/13/14/21) + S (TD-SYS-15/22/23) + 3h cada (UX-D08/15/17/25) + 6h (UX-D18)
**Owner:** @dev

## Contexto / Motivação

Do assessment (Plano de Resolução, item 9): este é o item de fecho da sequência, agrupando os débitos remanescentes de menor urgência individual, mas que ainda representam custo crescente ou higiene necessária:

- **TD-DAT-04** (metade "b" de UX-D24, via Emenda 3) — pseudonimização: nome da criança é hoje chave primária. Pseudonimizar exige migração de chave, não apenas UI — por isso depende de TD-SYS-09 (`StorageAdapter`, Story 2.1) já concluído.
- **UX-D11** — responsividade por `zoom` (escala), não por refluxo de layout — compromete uso em tablets/Chromebooks, o canal de distribuição mais provável para escolas (R10).
- **UX-D22** — `<style>` reinjetado em 6 raízes de tela, invisível a lint/minificação/auditoria. O assessment nota que "é por isso que `prefers-reduced-motion` nunca apareceu em varredura" — relação direta com a dificuldade de detectar UX-D07 antes da Story 0.1.
- **Demais itens P3**: balanceamento hardcoded (TD-SYS-13), bundle sem code splitting (TD-SYS-12), ausência de CI/CD (TD-SYS-21), loading state (UX-D08), medição de performance percebida (UX-D18), alvos de toque AAA (UX-D15), rastreabilidade de `pause`/calendário (UX-D17), legenda de atalhos de teclado (UX-D25), artefato PHP da Hostinger versionado (TD-SYS-22), majors sem ADR (TD-SYS-23).
- **TD-SYS-14/TD-SYS-15** — o assessment nota que a correção estrutural (consolidar cópias de deploy, corrigir MIME do servidor local) é tardia por natureza (item 9), mas a **verificação pontual** de publicação correta (T0.5) já foi antecipada e cumprida no fecho da Story 0.1 (0b). Esta story completa a correção estrutural definitiva.

## Escopo

1. Migrar a chave primária do operador de "nome" para um identificador pseudonimizado, preservando a capacidade de reidentificação apenas onde estritamente necessário (TD-DAT-04).
2. Substituir o mecanismo de responsividade por `zoom` por refluxo real de layout (media queries / flex/grid responsivo) (UX-D11).
3. Extrair os blocos `<style>` reinjetados das 6 raízes de tela para uma folha de estilo auditável por lint (UX-D22).
4. Consolidar as 4 cópias divergentes do artefato de deploy em uma única fonte canônica (TD-SYS-14).
5. Corrigir o servidor local para servir JS/CSS com o `Content-Type` correto, não `application/octet-stream` (TD-SYS-15).
6. Externalizar o balanceamento hoje hardcoded para configuração (TD-SYS-13).
7. Implementar code splitting básico para reduzir o bundle único de 910 KB (TD-SYS-12).
8. Configurar um pipeline mínimo de CI/CD, substituindo a publicação manual por ZIP (TD-SYS-21).
9. Remover `dist/default.php` da Hostinger do artefato de build versionado (TD-SYS-22).
10. Documentar em ADR a adoção das majors recentes (TS 7, Vite 8, ESLint 10) sem nota de migração prévia (TD-SYS-23).
11. Implementar loading state visível onde hoje não existe (UX-D08).
12. Adicionar medição básica de performance percebida (LCP/INP/CLS) (UX-D18).
13. Ajustar alvos de toque para conformidade AAA (2.5.5), superando o AA já atendido (UX-D15).
14. Documentar formalmente `pause` e a lógica de calendário em uma story/nota de rastreabilidade, fechando a violação do Artigo IV citada no assessment (UX-D17).
15. Adicionar legenda visível dos atalhos de teclado já implementados (UX-D25).

## Critérios de Aceitação

- [ ] Operador é identificado por chave pseudonimizada; nome não é mais chave primária de nenhuma estrutura de dados.
- [ ] Layout se reorganiza (refluxo) em pelo menos 3 breakpoints (mobile, tablet, desktop), sem depender de `zoom`.
- [ ] Nenhum `<style>` é injetado via JS nas 6 telas — todo CSS está em arquivo(s) auditável(is) por lint.
- [ ] Existe uma única cópia canônica do artefato de deploy, documentada no processo de publicação.
- [ ] Servidor local serve `.js`/`.css` com `Content-Type` correto (`application/javascript`, `text/css`).
- [ ] Parâmetros de balanceamento estão em arquivo(s) de configuração, não hardcoded no código de lógica.
- [ ] Bundle principal é dividido em pelo menos 2 chunks via code splitting, com redução mensurável do bundle inicial.
- [ ] Pipeline de CI/CD mínimo executa lint + test + typecheck + build a cada push (ou PR).
- [ ] `dist/default.php` não está mais presente no artefato de build versionado.
- [ ] ADR documentando a adoção de TS 7 / Vite 8 / ESLint 10 existe em `docs/architecture/` (ou local equivalente).
- [ ] Loading state visível existe onde ações assíncronas (mesmo que locais) ocorrem.
- [ ] Métricas de LCP/INP/CLS são coletadas e registradas (mesmo que informalmente, via ferramenta de dev tools documentada).
- [ ] Alvos de toque atendem 2.5.5 AAA (≥44×44px) nos elementos interativos principais.
- [ ] `pause` e a lógica de calendário têm nota de rastreabilidade documental, referenciando esta story e o assessment.
- [ ] Legenda de atalhos de teclado é visível na UI (ex.: modal de ajuda ou rodapé).

## Definition of Done

- [ ] Todos os itens do escopo implementados e verificados individualmente pelos critérios de aceitação correspondentes.
- [ ] QA Gate (@qa) executado com verdicto PASS/CONCERNS.
- [ ] Status da story atualizado para `Ready` por @po antes do início da implementação.

## Riscos

- **R10** (Média, Alto): não adoção em sala de aula por inviabilidade em tablet/Chromebook — mitigado por UX-D11 (refluxo).
- **R7** (Média, Médio): publicação da cópia errada do artefato — mitigado pela consolidação de TD-SYS-14/15.
- Risco de escopo: esta story agrupa 15 débitos de naturezas distintas; pode ser dividida em sub-entregas independentes (ex.: uma entrega para dados/privacidade, outra para deploy/build, outra para UX residual) sem prejuízo à ordem geral do epic, desde que a dependência de TD-SYS-09 (para TD-DAT-04) e de Story 3.1 (para UX-D11, que assume código já decomposto) seja respeitada.

## Dependências

- **Depende de:** Story 2.1 (TD-SYS-09 concluído, para TD-DAT-04), Story 3.1 (código decomposto, para UX-D11 e itens de performance).
- **Não bloqueia** nenhuma story adicional — é o fecho do epic.

## File List

- [ ] A definir durante a implementação (múltiplos arquivos — ver escopo).

## Change Log

| Data | Autor | Mudança |
|---|---|---|
| 2026-09-07 | @pm (Morgan) | Criação da story — Fase 10 do Brownfield Discovery |
