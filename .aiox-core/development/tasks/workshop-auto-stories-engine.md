# Workshop Automático - Story Development Cycle

**Task ID:** workshop-auto-stories-engine  
**Type:** Workflow Engine  
**Version:** 2.0  
**Author:** Orion (AIOX Master)

---

## 📋 Overview

Executa o **Story Development Cycle** em modo YOLO automático com checkpoints críticos apenas nos gates de validação (@po) e qualidade (@qa).

**Fluxo:**
```
@sm: Criar Story (YOLO)
  ↓ auto-advance
@po: Validar Story ⏹️ CHECKPOINT
  ↓ se aprovado
@dev: Implementar (YOLO)
  ↓ auto-advance
@qa: QA Gate ⏹️ CHECKPOINT
  ↓ se aprovado
@devops: Push to Remote
  ↓ auto-advance
✅ Story Done!
```

---

## 🎯 Inputs

| Input | Tipo | Requerido | Descrição |
|-------|------|----------|-----------|
| `mode` | enum | Não | `yolo` (padrão), `interactive`, ou `preflight` |
| `story_count` | number | Não | Quantas stories executar (padrão: 1) |
| `auto_push` | boolean | Não | Auto-push ao @devops? (padrão: true) |
| `demo_topic` | string | Não | Tópico demo específico, senão sorteado |

---

## 🔧 Execution Steps

### Step 1: Validar Ambiente
```
✓ Git repository ativo?
✓ Branch: master ou feature branch?
✓ `.aiox-core/` acessível?
✓ Agents disponíveis (@sm, @po, @dev, @qa, @devops)?
```

### Step 2: Carregar Workflow
```
Load: .aiox-core/development/workflows/workshop-auto-stories.yaml
Validate YAML syntax
Resolve agent definitions
```

### Step 3: Executar Engine
```
Initialize engine (real subagents)
Loop (for each story in story_count):
  - Phase 1: @sm create (YOLO)
  - Phase 2: @po validate (CHECKPOINT - await input)
  - Phase 3: @dev implement (YOLO)
  - Phase 4: @qa review (CHECKPOINT - await input)
  - Phase 5: @devops push (auto)
End loop
```

### Step 4: Reportar Resultados
```
- Stories criadas: N
- Validações aprovadas: N/N
- Implementações completas: N/N
- Quality gates aprovados: N/N
- Pushes bem-sucedidos: N/N
- Histórico de checkpoints: [{timestamp, agent, verdict}]
```

---

## ✅ Acceptance Criteria

| Critério | Verificação |
|----------|------------|
| Workflow carregado corretamente | YAML válido + syntax OK |
| @sm cria story em YOLO mode | Story file criada, status=Draft |
| @po checkpoint funciona | Prompt exibido, entrada capturada |
| @po aprovação = auto-advance | Implementação inicia sem prompt |
| @dev YOLO sem prompts extras | Código implementado, commits registrados |
| @qa checkpoint funciona | Prompt exibido, entrada capturada |
| @qa aprovação = story Done | Story status=Done, QA report criado |
| @devops push automático | Commits pushed, PR/branch atualizado |
| Stories múltiplas | Loop executa story_count vezes |
| Erro handling gracioso | Erros não travam workflow, retornam step anterior |

---

## 📊 Outputs

**Arquivo de log:** `.aiox/workshop-logs/auto-stories-{timestamp}.json`

```json
{
  "workflow_id": "workshop-auto-stories",
  "mode": "yolo-with-checkpoints",
  "execution_started": "2026-09-08T14:30:00Z",
  "stories_executed": [
    {
      "story_id": "DEMO-001",
      "title": "Implementar autenticação OAuth2",
      "phases": {
        "create": {
          "agent": "sm",
          "status": "completed",
          "duration_seconds": 45
        },
        "validate": {
          "agent": "po",
          "status": "completed",
          "checkpoint": true,
          "verdict": "approve",
          "score": 8.5,
          "duration_seconds": 120
        },
        "implement": {
          "agent": "dev",
          "status": "completed",
          "duration_seconds": 180,
          "files_changed": 12,
          "tests_added": 5,
          "commits": 3
        },
        "review": {
          "agent": "qa",
          "status": "completed",
          "checkpoint": true,
          "verdict": "pass",
          "issues_found": 0,
          "duration_seconds": 60
        },
        "push": {
          "agent": "devops",
          "status": "completed",
          "commits_pushed": 3,
          "duration_seconds": 30
        }
      },
      "final_status": "Done",
      "total_duration_seconds": 435
    }
  ],
  "checkpoints": [
    {
      "timestamp": "2026-09-08T14:31:00Z",
      "checkpoint": "PO_Validation_Gate",
      "story_id": "DEMO-001",
      "user_input": "approve",
      "duration_seconds": 120
    },
    {
      "timestamp": "2026-09-08T14:35:00Z",
      "checkpoint": "QA_Gate",
      "story_id": "DEMO-001",
      "user_input": "pass",
      "duration_seconds": 60
    }
  ],
  "summary": {
    "total_stories": 1,
    "succeeded": 1,
    "failed": 0,
    "total_duration_seconds": 435,
    "success_rate": "100%"
  }
}
```

---

## 🚀 Como Executar

### Opção 1: Comando via @aiox-master
```bash
*workflow workshop-auto-stories --mode=yolo-with-checkpoints --stories=1
```

### Opção 2: Diretamente
```bash
node .aiox-core/core/engine/workflow-engine.js workshop-auto-stories
```

### Opção 3: CLI
```bash
aiox workflow workshop-auto-stories
```

---

## 🔄 Recovery & Error Handling

| Erro | Ação |
|------|------|
| Workflow load falha | Retorna erro YAML, abort |
| @sm create falha | Log + skip, próxima story |
| @po checkpoint timeout | Use padrão (approve), continue |
| @dev implement falha | Retorna para dev, retry manual |
| @qa checkpoint timeout | Use padrão (pass), continue |
| @devops push falha | Log erro, manual push required |

---

## 📈 Métricas Coletadas

```yaml
metrics:
  - story_creation_time
  - po_checkpoint_wait_time
  - dev_implementation_time
  - dev_coderabbit_iterations
  - qa_checkpoint_wait_time
  - qa_issues_found_count
  - total_cycle_time
  - stories_per_hour
  - checkpoint_approval_rate
```

---

## 🎓 Use Cases

### ✅ Ideal para:
- Demonstrações do processo ágil
- Treinamentos de equipe
- Validação do workflow
- Desenvolvimento contínuo com validação
- Benchmarking de velocity

### ❌ NÃO use para:
- Hotfixes urgentes (use SDC simples)
- Spikes exploratórios
- Tasks técnicas sem story

---

## 📝 Notes

- **Checkpoints** são interações humanas críticas (PO approve, QA verdict)
- **YOLO phases** rodam sem prompts adicionais (criação e implementação automáticas)
- **Auto-advance** move para próxima fase quando condições são atendidas
- **Demo topics** são gerados aleatoriamente se não especificado
- **Logs detalhados** salvos em `.aiox/workshop-logs/` para auditoria

---

## 🔗 Referências

- Workflow: `.aiox-core/development/workflows/workshop-auto-stories.yaml`
- Story Development Cycle: `workflow-execution.md` (Article III)
- Agente Authority: `.claude/rules/agent-authority.md`

---

**Created:** 2026-09-08  
**Version:** 2.0.0  
**Status:** Ready
