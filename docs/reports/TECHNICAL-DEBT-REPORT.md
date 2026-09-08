# 📊 Relatório de Débito Técnico
**Projeto:** Nuclear Challenge
**Data:** 07/09/2026
**Versão:** 1.0
**Fonte:** `docs/prd/technical-debt-assessment.md` (assessment final, Fase 8 do Brownfield Discovery — 47 débitos)
**Preparado por:** @analyst (Alex), Fase 9 do Brownfield Discovery
**Base de custo:** R$ 150/hora

---

## 🎯 Executive Summary

### Situação Atual

O Nuclear Challenge é um simulador educacional de operação de reator nuclear voltado a crianças, **ainda pré-lançamento, sem usuários em produção**. Essa é a boa notícia: nada do que está descrito aqui já causou dano a um usuário real — mas dois dos problemas identificados só deixarão de ser risco *teórico* no dia em que a primeira criança usar o produto.

O assessment técnico independente (arquitetura + UX + QA) mapeou **47 débitos técnicos** no código atual. Destes, **4 têm um perfil de urgência diferente de todos os outros**: não competem por prioridade na fila normal de desenvolvimento porque envolvem (a) risco de dano físico a uma criança ou (b) perda irreversível dos dados de progresso dela. Esses 4 itens custam, juntos, **cerca de 3 horas de trabalho (R$ 450)** e não têm nenhuma dependência técnica pendente — podiam ter sido corrigidos ontem.

O restante dos 47 débitos é o que se espera encontrar em qualquer produto que cresceu rápido sem processo formal: falta de controle de versão, testes que não testam nada de fato, acessibilidade quase inexistente, e um componente principal que cresceu demais para ser seguro de alterar.

**Achado mais importante para a diretoria:** as "redes de segurança" que deveriam permitir alterar o produto com confiança — testes automatizados, verificação de tipos, lint — foram auditadas e **não funcionam**. Um teste manual (mutação de código controlada, em ambiente isolado) provou que o gate de testes aprova a **destruição total** de uma funcionalidade e reprova a mesma funcionalidade só por estar formatada de forma diferente. Ou seja: hoje, nada impede uma regressão grave de ser publicada sem que ninguém perceba.

### Números Chave

| Métrica | Valor |
|---|---|
| Total de débitos identificados | **47** |
| Críticos | 10 |
| Altos | 14 |
| Médios | 18 |
| Baixos | 5 |
| Itens fora da fila normal (risco físico ou perda de dado) | **4** |
| Custo para eliminar os 4 riscos irreversíveis | **~3 h ≈ R$ 450** |
| Esforço quantificado em horas (subconjunto frontend/UX, 17 débitos) | **160,75 h ≈ R$ 24.112,50** |
| Débitos de sistema e dados/testes (23 + 7 = 30) | Dimensionados em ordem de grandeza (S/M/L/XL), não em horas fixas — ver §Análise de Custos |
| Controle de versão (Git) | **Inexistente** — nenhuma alteração pode ser revertida hoje |
| Ações de execução já autorizadas e ainda não feitas | **3** (ver Fase 0) |

### Recomendação

1. **Autorizar hoje** as 3 horas de correção que eliminam os dois riscos irreversíveis (dano físico e perda de dado). Não há motivo técnico, de custo ou de prazo para adiar — a decisão já foi tomada em ciclo anterior e nunca foi executada.
2. **Não tratar os 47 débitos como um bloco único.** O plano de resolução já os sequencia em ondas com dependências reais; investir de forma faseada, não em "big bang".
3. **Tratar a falsa sensação de segurança dos testes como prioridade de engenharia, não de produto** — sem isso, cada nova funcionalidade aumenta o risco em vez de reduzi-lo.

---

## 💰 Análise de Custos

### Custo de RESOLVER

**Frontend/UX — único subconjunto com horas específicas atribuídas por especialista (17 débitos, 160,75 h):**

| Categoria de severidade | Débitos | Horas | Custo (R$ 150/h) |
|---|---|---|---|
| Crítica | 2 | 1,75 + 28 = 29,75 h | R$ 4.462,50 |
| Alta | 5 | 10+10+24+12+8 = 64 h | R$ 9.600,00 |
| Média | 7 | 20+16+6+4+3+3+6 = 58 h | R$ 8.700,00 |
| Baixa | 3 | 3+3+3 = 9 h | R$ 1.350,00 |
| **Total frontend/UX** | **17** | **160,75 h** | **R$ 24.112,50** |

**Sistema e Dados/Testes (30 débitos) — dimensionados em ordem de grandeza pelo próprio assessment, não em horas fixas** (decisão deliberada: compromisso de horas pertence ao planejamento de sprint, não ao discovery). Usando a legenda oficial do assessment (S ≤ meio dia · M 1–3 dias · L 1–2 semanas · XL > 2 semanas), a leitura direcional é:

| Porte | Débitos (sistema + dados) | Faixa de horas (estimativa ilustrativa) |
|---|---|---|
| S (≤ meio dia) | 13 | ~4h cada → ~52 h |
| M (1–3 dias) | 13 | ~16h cada → ~208 h |
| L (1–2 semanas) | 2 | ~60h cada → ~120 h |
| XL (> 2 semanas) | 2 | ≥ 80h cada → **≥ 160 h (piso aberto)** |
| **Total (piso)** | **30** | **≥ 540 h ≈ R$ 81.000+ (piso, não teto)** |

> **Leitura de negócio:** os R$ 24.112,50 de frontend/UX são o único número **firme** deste relatório — vieram de estimativa especialista linha a linha. A faixa de sistema/dados é um **piso direcional**, não uma cotação: os dois itens XL (quebrar o monolito de código e destravar a verificação de tipos) são historicamente os que mais estouram estimativa em projetos deste porte. O número realista de investimento total para eliminar os 47 débitos fica **acima de R$ 100.000**, a ser refinado em planejamento de sprint (Fase 10).

### Custo de NÃO RESOLVER (Risco Acumulado)

| Risco | Probabilidade | Impacto | O que acontece se nada for feito |
|---|---|---|---|
| Dano físico a criança (efeitos visuais 8,3–11,1 Hz, sem "reduzir movimento") | Média-Alta | Crítico | Risco fotoconvulsivo/vestibular real em uma população que não tem como se autoproteger nem entender o que está acontecendo |
| Perda silenciosa do progresso de uma turma inteira | Média | Crítico | Cada vez que a leitura de dados falhar (evento já possível hoje), o próximo salvamento sobrescreve o histórico da turma inteira, sem aviso a ninguém |
| Regressão grave publicada sem detecção | Alta (comprovada) | Crítico | Já foi demonstrado por teste controlado que o gate de qualidade aprova a quebra total de uma funcionalidade |
| Impossibilidade de reverter qualquer alteração | Média | Crítico | Sem Git, um erro introduzido em produção não tem caminho de volta — é reescrever do zero |
| Exclusão de crianças com deficiência visual/motora | Alta | Alto | Produto educacional inutilizável por leitor de tela; falha de contraste penaliza especificamente daltônicos |
| Não adoção em sala de aula (tablets/Chromebooks) | Média | Alto | Responsividade frágil compromete o canal de distribuição mais provável (escolas) |
| Exposição de credencial de banco de dados | Baixa | Crítico | Chave de acesso privilegiado presente em arquivo de configuração do lado do cliente |

**O custo de não resolver não é fixo — ele cresce com o tempo e com a adoção.** Hoje, sem usuários reais, o custo de qualquer um destes riscos se materializar é reputacional e de esforço de correção. No dia do lançamento, o mesmo risco passa a ter uma criança real do outro lado.

---

## 📈 Impacto no Negócio

### Segurança do Usuário (destaque — público infantil)

Este é o único ponto do relatório com potencial de dano físico, e é onde a diretoria deve concentrar atenção imediata. O produto usa efeitos visuais de tela (tremores, distorções, tela de alerta) com frequências entre 3,57 Hz e 11,1 Hz, **sem nenhum mecanismo de redução** (a preferência de sistema `prefers-reduced-motion`, padrão de acessibilidade da web, não é respeitada). Frequências nessa faixa são associadas a risco fotoconvulsivo e efeitos vestibulares (tontura, náusea) em crianças. Não há hoje nenhum "escape" — a criança não pode desligar o efeito.

A correção está pronta para execução: **1,75 hora**, sem nenhuma dependência técnica pendente. É, isoladamente, o item de maior relação impacto/custo de todo o assessment.

### Integridade de Dados (perda de progresso)

Dois bugs independentes no código atual — não hipóteses, comportamento já presente — podem destruir o histórico de progresso de uma criança ou de uma turma inteira:

1. A função que salva o resultado de uma partida reconstrói o registro do zero, descartando qualquer campo que ela não reconheça explicitamente — na prática, apaga dado sem querer.
2. Quando a leitura dos dados salvos falha (situação que já pode ocorrer hoje), o sistema trata isso silenciosamente como "nenhum operador cadastrado" — e o próximo cadastro sobrescreve o arquivo inteiro da turma, sem aviso.

Um terceiro problema agrava os outros dois: quando a gravação falha, o erro só aparece na tela de login — se a criança já estiver jogando, a falha é **completamente invisível**. Ninguém percebe que o progresso não foi salvo.

Juntos, esses três problemas custam **cerca de 1 hora** para receber uma proteção mínima (guarda anti-destruição). A correção definitiva e mais robusta vem depois, já dentro do plano faseado.

### Experiência do Usuário

Fora dos dois riscos acima, o produto tem lacunas relevantes de experiência: ausência quase total de acessibilidade (leitor de tela, navegação por teclado, contraste de cores), nenhuma tela de "sem dados ainda" (um professor pode interpretar ausência de dado como produto quebrado), e uma camada de responsividade frágil (zoom em vez de reorganização de layout) que compromete o uso em tablets e Chromebooks — o canal de distribuição mais provável para uso escolar.

### Manutenibilidade

O código está concentrado em um único arquivo de aplicação com mais de mil linhas, sem separação de camadas, sem controle de versão, e com verificações de qualidade (testes, tipos, lint) que existem apenas na forma — não na função. Isso significa que **cada nova funcionalidade fica progressivamente mais arriscada e mais lenta de entregar**, porque não há rede de segurança real para pegar erros antes de irem ao ar. O assessment resume isso de forma direta: "o produto está funcionalmente maduro; a rede de segurança que autorizaria alterá-lo é uma ilusão de conformidade."

---

## ⏱️ Timeline Recomendado

### Fase 0: Ações Imediatas de Segurança (~3 horas / R$ 450)

Estas 3 ações **já foram decididas em ciclo anterior e continuam não executadas** — não dependem de nenhuma aprovação nova, apenas de execução:

| Ação | Responsável | Esforço | O que resolve |
|---|---|---|---|
| Inicializar controle de versão (Git) + arquivo de exclusões | @devops | ~0,25 h | Torna qualquer correção futura reversível; pré-requisito das duas ações seguintes |
| Corrigir efeitos visuais sem escape (risco de dano físico) | @dev | ~1,75 h | Remove o único risco de dano físico do produto |
| Implementar guarda anti-destruição de dados | @dev | ~1 h | Remove os dois riscos de perda irreversível de progresso |

### Fase 1: Quick Wins (curto prazo — semanas 1-2)

Fundação de qualidade e design: padronizar visual (tokens de design, tipografia acessível), reorganizar a estrutura de arquivos do projeto, corrigir a base de configuração de build/lint, e — criticamente — **substituir os testes que não testam nada** por um conjunto real de verificações comportamentais, incluindo destravar a verificação de tipos hoje desligada.

### Fase 2: Fundação (médio prazo — semanas 3-6)

Criar uma camada de dados confiável (contrato formal para leitura/gravação, incluindo a política que evita apagar dados por engano), viabilizar a primeira tela nova do produto, excluir dados de operador a pedido, e endereçar o primeiro pacote de acessibilidade (leitor de tela, navegação por teclado, contraste, cor não ser o único sinal de erro/acerto).

### Fase 3: Otimização (longo prazo — contínuo)

Quebrar o componente monolítico em partes menores e testáveis (o item de maior esforço do assessment — semanas, não dias — e que só deve começar depois de existir uma base de comparação automatizada para não introduzir regressões durante a própria refatoração), pseudonimizar dados pessoais de crianças, e resolver o restante dos itens de baixa prioridade (CI/CD, performance, higiene de deploy).

---

## 📊 ROI da Resolução

- **Investimento mínimo para eliminar os riscos irreversíveis:** R$ 450 (3 horas). Retorno: elimina o único cenário de dano físico e os dois cenários de perda de dado de criança identificados no produto. Não existe alternativa de "mitigar parcialmente" mais barata — o custo já é o piso.
- **Investimento no subconjunto quantificado (frontend/UX):** R$ 24.112,50. Retorno: produto utilizável por crianças com deficiência, visualmente consistente, sem os pontos de fricção que mais provavelmente gerariam reclamação de professor/responsável.
- **Investimento total estimado (piso, todos os 47 débitos):** a partir de R$ 100.000, refinável em planejamento de sprint. Retorno: um produto onde alterações futuras podem ser feitas com confiança, porque as verificações de qualidade voltam a significar algo — hoje elas não significam.
- **Custo de não agir:** não é uma linha de orçamento — é um risco de reputação (dano a uma criança, perda de dado de uma turma) que, uma vez materializado, custa incomparavelmente mais para remediar (confiança de escola, de responsáveis, e possivelmente exposição legal envolvendo dados de menores) do que as 3 horas que o resolveriam preventivamente.

---

## ✅ Próximos Passos

1. **Autorizar hoje** a execução das 3 ações de Fase 0 (git init com @devops; correção dos efeitos visuais e guarda de dados com @dev) — sem essas 3 horas, os dois riscos irreversíveis continuam ativos a cada dia que passa.
2. **Aprovar o orçamento e sequenciamento das Fases 1-3** com base no plano já validado por arquitetura, UX e QA (não é necessário reabrir a análise técnica — ela já foi auditada em três rodadas independentes).
3. **Definir, antes do lançamento**, um teste específico que decida se a funcionalidade de histórico de partidas (hoje limitada a um ranking, não um histórico real) precisa de redesenho de dados — evita comprometer uma funcionalidade pedagógica planejada.
4. **Não lançar publicamente** o produto antes de concluída, no mínimo, a Fase 0.

---

## 📎 Anexos

- Assessment técnico completo (fonte primária de todos os números deste relatório): `docs/prd/technical-debt-assessment.md`
- Revisão de UX/acessibilidade: `docs/reviews/ux-specialist-review.md`
- Revisão de QA (incluindo prova por mutação do gate de testes): `docs/reviews/qa-review.md`
- Arquitetura do sistema: `docs/architecture/system-architecture.md`

**Nota metodológica:** todos os números de horas e classificações de severidade citados neste relatório vêm diretamente do assessment técnico auditado (Fase 8 do Brownfield Discovery), sem estimativas adicionais não rastreáveis à fonte, exceto as faixas ilustrativas de conversão S/M/L/XL → horas, explicitamente marcadas como piso direcional e não como cotação de projeto.

---

*Relatório preparado por @analyst (Alex) — Fase 9 do Brownfield Discovery (`create_awareness_report`)*
*Base: 47 débitos técnicos · 10 críticos · 14 altos · 18 médios · 5 baixos · Gate de origem do assessment: APPROVED COM RESSALVAS*
