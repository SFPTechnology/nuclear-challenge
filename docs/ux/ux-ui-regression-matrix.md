# Matriz de regressão UX/UI

| Área | Antes | Depois | Risco | Teste | Resultado |
|---|---|---|---|---|---|
| Alerta de armazenamento | Mensagem sem ação | Alerta assertivo com `TENTAR NOVAMENTE` | baixo | `global-error-banner.test.tsx` | APROVADO |
| Persistência | Contrato `window.storage` | Contrato inalterado | alto | suíte de StorageAdapter + testes 0c | APROVADO |
| Explosão/meltdown | risco de tela travada | `Boom` conclui em 4 s e limpa timers | médio | `boom.test.tsx` | APROVADO |
| Responsividade | CSS com breakpoints existentes | sem alteração de regras | médio | build + inspeção automatizada | PARCIAL |
| Acessibilidade | roles/labels existentes | banner com role alert e retry rotulado | baixo | testes de acessibilidade existentes | APROVADO |

Pendência: capturar evidência visual manual nos breakpoints 320, 360, 390, 412, 480, 768 e desktop.
