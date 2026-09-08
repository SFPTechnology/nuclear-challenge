# Workshop Completamente Automático - YOLO Puro

**Task ID:** workshop-full-yolo-engine  
**Type:** Workflow Engine (Full Automation)  
**Version:** 1.0  
**Author:** Orion (AIOX Master)

---

## 📋 Overview

Executa o **Story Development Cycle** em modo **COMPLETAMENTE AUTOMÁTICO YOLO**.

- ✅ Zero checkpoints
- ✅ Zero prompts
- ✅ Zero human input
- ✅ Automação total de @sm → @po → @dev → @qa → @devops

**Ideal para:** Demos de velocidade, benchmarking, validação de workflow.

---

## 🎯 Fluxo (Automático)

```
@sm: Criar Story (YOLO)
  ↓ auto-advance
@po: Validar (Auto-approve)
  ↓ auto-advance
@dev: Implementar (YOLO)
  ↓ auto-advance
@qa: QA Gate (Auto-approve)
  ↓ auto-advance
@devops: Push
  ↓ auto-advance
✅ Story Done! → Próxima story...
```

---

## 🚀 Inputs

| Input | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `stories` | number | 10 | Quantas stories criar |
| `demo_topics` | boolean | true | Gerar tópicos aleatórios? |
| `auto_push` | boolean | true | Auto-push ao final? |
| `log_level` | enum | INFO | DEBUG, INFO, WARN |

---

## ✅ Execution Steps

### Step 1: Validar Ambiente
```
✓ Git repository ativo?
✓ Agents disponíveis?
✓ Workflow YAML valid?
```

### Step 2: Iniciar Loop
```
For i = 1 to story_count:
  Phase 1: @sm create (YOLO)
  Phase 2: @po validate (auto-approve)
  Phase 3: @dev implement (YOLO)
  Phase 4: @qa review (auto-approve)
  Phase 5: @devops push (auto)
End loop
```

### Step 3: Reportar Métricas
```
- Stories criadas: N
- Validações: N approved
- Implementações: N completed
- QA gates: N approved
- Pushes: N success
- Tempo total: XXm XXs
- Velocity: X stories/hora
```

---

## 📊 Outputs

**Log:** `.aiox/workshop-logs/full-yolo-{timestamp}.json`

```json
{
  "workflow_id": "workshop-full-yolo",
  "mode": "yolo-full-automation",
  "execution_started": "2026-09-08T15:00:00Z",
  "configuration": {
    "story_count": 10,
    "auto_topics": true,
    "auto_push": true
  },
  "stories_executed": [
    {
      "story_id": "YOLO-001",
      "title": "Implementar autenticação OAuth2",
      "phases": {
        "create": { "status": "completed", "duration_ms": 45000 },
        "validate": { "status": "completed", "auto_approved": true, "score": 8.5 },
        "implement": { "status": "completed", "duration_ms": 180000, "files": 12 },
        "review": { "status": "completed", "auto_approved": true, "issues": 0 },
        "push": { "status": "completed", "duration_ms": 30000 }
      }
    }
  ],
  "summary": {
    "total_stories": 10,
    "succeeded": 10,
    "failed": 0,
    "total_duration_seconds": 3600,
    "velocity_stories_per_hour": 10,
    "avg_story_time_seconds": 360
  }
}
```

---

## 🎓 Use Cases

### 1. **Demo Rápida (5 stories)**
```bash
*workflow workshop-full-yolo --stories=5
```
**Tempo:** ~30 minutos  
**Resultado:** 5 stories completadas do zero

### 2. **Benchmarking (20 stories)**
```bash
*workflow workshop-full-yolo --stories=20
```
**Tempo:** ~2 horas  
**Resultado:** Velocity baseline da equipe

### 3. **Stress Test (50 stories)**
```bash
*workflow workshop-full-yolo --stories=50
```
**Tempo:** ~5 horas  
**Resultado:** Limite máximo do engine

---

## 📈 Métricas Coletadas

```yaml
performance_metrics:
  - creation_time_per_story
  - validation_time_per_story
  - implementation_time_per_story
  - qa_time_per_story
  - push_time_per_story
  - total_cycle_time
  - stories_per_hour
  - files_changed_total
  - tests_added_total
  - commits_total
  - success_rate
```

---

## ⚡ Configuração por Cenário

### Scenario A: Quick Demo (2 min showcase)
```
stories: 1
coderabbit: disabled (skip CodeRabbit)
tests: minimal (1 test only)
Result: 1 story in ~2 minutes
```

### Scenario B: Workshop Demo (30 min)
```
stories: 5
coderabbit: enabled (1 iteration)
tests: standard (3-5 per story)
Result: 5 stories in ~30 minutes
```

### Scenario C: Velocity Benchmark (2 hours)
```
stories: 10
coderabbit: enabled (2 iterations max)
tests: full (5-8 per story)
Result: 10 stories in ~2 hours
```

### Scenario D: Stress Test (5 hours)
```
stories: 50
coderabbit: enabled (1 iteration)
tests: standard
Result: 50 stories in ~5 hours
```

---

## 🔄 Error Handling

| Erro | Ação |
|------|------|
| Workflow load falha | Log + abort |
| @sm create falha | Log + skip story, continue |
| @po validate timeout | Auto-approve (YOLO mode) |
| @dev implement falha | Log + skip, continue |
| @qa review timeout | Auto-approve (YOLO mode) |
| @devops push falha | Log error, continue next story |

---

## 📝 Como Executar

### Comando Simples
```bash
*workflow workshop-full-yolo
```
→ Cria 10 stories (default)

### Com Custom Story Count
```bash
*workflow workshop-full-yolo --stories=5
```
→ Cria 5 stories

### Com Debug
```bash
*workflow workshop-full-yolo --stories=20 --log_level=DEBUG
```
→ 20 stories com logs verbose

### Sem Auto-Push
```bash
*workflow workshop-full-yolo --stories=10 --auto_push=false
```
→ Cria 10 stories, manual push after

---

## 🎯 Expected Results (10 stories)

```
📊 WORKSHOP-FULL-YOLO COMPLETION

Execution Time: 61 minutes
Stories Completed: 10/10 (100%)

Per Story Avg:
  - Creation: 45s
  - Validation: 30s (auto)
  - Implementation: 3m 15s
  - QA: 1m 10s (auto)
  - Push: 25s
  ─────────────────────────
  Total per story: 6m 5s

Aggregate Metrics:
  - Files changed: 120
  - Tests added: 60
  - Commits: 30
  - Lines of code: 4,500

Velocity: 10 stories/hour
Success Rate: 100%
```

---

## 📚 Comparação com Outros Modos

| Feature | Auto Stories | Auto + Checkpoints | Full YOLO |
|---------|--------------|-------------------|-----------|
| @sm creation | YOLO | YOLO | YOLO |
| @po validation | YOLO | Checkpoint | Auto-approve |
| @dev implementation | YOLO | YOLO | YOLO |
| @qa review | YOLO | Checkpoint | Auto-approve |
| Human input | None | 2 gates | ZERO |
| Use case | N/A | Interactive | Demo/Benchmark |
| Ideal stories | 1-3 | 1-5 | 10+ |

---

## 🚨 Important Notes

- **YOLO mode** = Auto-approval mesmo com issues menores
- **Zero checkpoints** = Sem pausa para decisão humana
- **Logging completo** = Tudo registrado em JSON para auditoria
- **Graceful degradation** = Falhas em 1 story não travam o resto
- **Safety first** = CRITICAL issues ainda retornam erro

---

## 🔗 Referências

- Workflow: `.aiox-core/development/workflows/workshop-full-yolo.yaml`
- Interactive Mode: `workshop-auto-stories.yaml`
- Story Lifecycle: `.claude/rules/story-lifecycle.md`

---

**Created:** 2026-09-08  
**Version:** 1.0.0  
**Status:** Ready  
**Mode:** YOLO PURO 🚀
