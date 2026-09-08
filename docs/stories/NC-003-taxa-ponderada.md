# Story NC-003 — Taxa de acerto ponderada por dificuldade

Status: Blocked — aguardando projeto executável

## Objetivo

Como professor, quero comparar desempenho considerando a dificuldade da fase, para evitar que partidas fáceis distorçam o ranking.

## Escopo rastreado

- Registrar a fase por operação quando necessário.
- Calcular índice ponderado pela dificuldade.
- Manter compatibilidade com operadores já persistidos sem o novo campo.

## Critérios de aceitação

- [ ] Fórmula e pesos são definidos em contrato rastreável antes da implementação.
- [ ] Dados legados recebem fallback explícito e não são apagados.
- [ ] Ranking e gráficos identificam quando a métrica é ponderada.
- [ ] Testes cobrem as cinco fases e registros sem fase.
- [ ] Gates de qualidade passam.

## File List

- [ ] A definir após provisionamento do projeto executável.
