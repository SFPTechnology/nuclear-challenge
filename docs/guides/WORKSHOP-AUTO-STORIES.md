# 🚀 Workshop Automático - Story Development Cycle

## O que é?

**Workshop Automático** é um modo especial do Story Development Cycle que orquestra toda a pipeline (criação → validação → implementação → QA) com **checkpoints críticos apenas nos gates mais importantes**.

```
@sm: Criar Story (YOLO) ──┐
                          ├─→ Auto-advance
@po: Validar Story ⏹️ ───┤ (Checkpoint)
                          ├─→ Se aprovado
@dev: Implementar ────────┤
                          ├─→ Auto-advance
@qa: Quality Gate ⏹️ ────┤ (Checkpoint)
                          ├─→ Se aprovado
@devops: Push ────────────┤
                          └─→ ✅ Story Done!
```

## Quando usar?

✅ **Use para:**
- Demonstrações do processo ágil
- Treinamentos de equipe
- Validação de workflows
- Desenvolvimento contínuo com checkpoints de qualidade
- Benchmarking de velocity

❌ **NÃO use para:**
- Hotfixes urgentes
- Spikes exploratórios
- Tasks puramente técnicas

## Quick Start

### 1️⃣ Iniciar o Workshop (1 story)

```bash
*workflow workshop-auto-stories
```

Ou:

```bash
@aiox-master *workflow workshop-auto-stories --mode=yolo-with-checkpoints --stories=1
```

### 2️⃣ Aguardar Checkpoint #1: PO Validation

Quando aparecer:

```
⏹️ **CHECKPOINT: PO_Validation_Gate**

Story: DEMO-001 - Implementar autenticação OAuth2

Checklist de validação (10 pontos):
- ✅ Título claro e objetivo
- ✅ Descrição completa do problema/necessidade
- ✅ Acceptance criteria testáveis
- ✅ Escopo bem definido (IN/OUT)
- ✅ Dependências mapeadas
- ✅ Estimativa de complexidade
- ✅ Valor de negócio identificado
- ✅ Riscos documentados
- ✅ Critérios de Done claros
- ✅ Alinhamento com PRD/Epic

**Seu voto:**
- Type 1: ✅ APROVA (Go para implementação)
- Type 2: ❌ REJEITA (Retorna para SM ajustar)
```

**Seu input:** Digite `1` para APROVAR

### 3️⃣ Dev implementa (automático)

O @dev executa em YOLO mode:
- Implementação de código
- Testes unitários
- Commits atômicos
- Atualização de File List
- Max 2 iterações CodeRabbit auto-fix

### 4️⃣ Aguardar Checkpoint #2: QA Gate

Quando aparecer:

```
🔍 **CHECKPOINT: QA_Gate**

Story: DEMO-001
Implementação concluída

Quality checks executados:
- ✅ Code Review: OK
- ✅ Unit Tests: 5 testes, 100% passing
- ✅ Acceptance Criteria: All met
- ✅ No Regressions: OK
- ✅ Performance: Acceptable
- ✅ Security: OWASP basics verified
- ✅ Documentation: Updated

**Seu voto:**
- Type 1: ✅ APPROVE
- Type 2: 🔄 CONCERNS (documentado)
- Type 3: ❌ FAIL (retorna para Dev)
```

**Seu input:** Digite `1` para APPROVE

### 5️⃣ Story Done! ✅

```
✅ **APPROVE**
Story: DEMO-001 pronta para production

@devops realizando push...
- Commits pushed: 3
- Branch atualizada
- Story status = Done

🎯 Workshop cycle concluído!
```

---

## Opções Avançadas

### Executar 3 stories seguidas

```bash
*workflow workshop-auto-stories --stories=3
```

### Com tópico de demo específico

```bash
*workflow workshop-auto-stories --demo_topic="Implementar cache distribuído com Redis"
```

### Sem auto-push (manual review antes)

```bash
*workflow workshop-auto-stories --auto_push=false
```

### Modo interativo (mais prompts)

```bash
*workflow workshop-auto-stories --mode=interactive
```

---

## Checkpoints Explicados

### ⏹️ Checkpoint 1: PO Validation

**O que acontece:**
- @po executa validação com 10 checks
- Score >= 7 = Go, Score < 7 = No-Go
- Aguarda sua decisão

**Suas opções:**
- `1` = Aprova → Continua para implementação
- `2` = Rejeita → Retorna para SM ajustar

**Por que?** Validação de requisitos é responsabilidade humana crítica.

---

### ⏹️ Checkpoint 2: QA Gate

**O que acontece:**
- @qa executa 7 quality checks
- Issues são documentadas
- Aguarda seu voto final

**Suas opções:**
- `1` = Approve → Story vai para production
- `2` = Concerns → Aprovado mas com observações
- `3` = Fail → Retorna para Dev corrigir

**Por que?** Qualidade é non-negotiable. Você tem a palavra final.

---

## Monitorando o Progresso

Cada fase exibe status em tempo real:

```
🚀 **Phase 1: Story Creation iniciada**
Story: DEMO-001
Agent: @sm

[5s] Analisando tópico...
[15s] Gerando acceptance criteria...
[30s] Criando arquivo da story...

✅ **Phase 1: Story Creation concluída**
Story criada: docs/stories/DEMO/001.story.md
```

---

## Entendendo os Logs

Os resultados são salvos em:

```
.aiox/workshop-logs/auto-stories-{timestamp}.json
```

Contém:
- Cada story executada
- Status de cada phase
- Tempo total de cada phase
- Checkpoint inputs (sua decisão)
- Resumo final

---

## Troubleshooting

### ❓ "Checkpoint timeout"

**Problema:** Checkpoint aguardando input mas nada aconteceu

**Solução:** 
- Verifique se vê a mensagem `⏹️ CHECKPOINT:...`
- Digite sua resposta (1, 2, ou 3)
- Ou use padrão: `Enter` para continuar

### ❓ "Dev implementation falhou"

**Problema:** @dev não conseguiu implementar

**Solução:**
- Log de erro será mostrado
- Story retorna para manual review
- Você pode ajustar AC e tentar novamente

### ❓ "Push failed"

**Problema:** @devops não conseguiu fazer push

**Solução:**
- Verifique: `git status`
- Verifique remote: `git remote -v`
- Execute manual: `@devops *push`

---

## Best Practices

1. **Leia os checkpoints com atenção** — PO e QA decidem Go/No-Go
2. **Rejeite se necessário** — Não force aprovações
3. **Analise os logs** — `.aiox/workshop-logs/` tem tudo
4. **1 workshop por sesão** — Depois refaça se precisar
5. **Documenta feedback** — Ajuda a melhorar o processo

---

## Relacionado

- **Story Development Cycle:** `workflow-execution.md`
- **Agent Authority:** `.claude/rules/agent-authority.md`
- **Quality Gates:** `.claude/rules/story-lifecycle.md`
- **Workflow Config:** `.aiox-core/development/workflows/workshop-auto-stories.yaml`

---

**Last Updated:** 2026-09-08  
**Version:** 2.0.0
