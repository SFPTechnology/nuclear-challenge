# Plano de correção — pausa do Nuclear Challenge

## Objetivo

Implementar um botão de pausa visível no rodapé da tela de jogo, na mesma região de `Sair / Meta / Seq / Tempo` da Image #2. Ao pausar, o jogo deve congelar o estado atual e abrir a tela funcional da Image #1, preservando a possibilidade de retomar ou acessar as ações disponíveis.

## Diagnóstico confirmado

1. O projeto possui múltiplas representações sem uma cadeia de build verificável:
   - `Arquivos_Diversos/nuclear-challenge-app.tsx` — fonte React;
   - `dist/index.html` — artefato estático alternativo;
   - `Arquivos_Diversos/usina.zip` — bundle que gerou a tela observada.
2. Não há `package.json`, scripts de build, testes ou runtime React configurado no workspace.
3. O botão foi tentado por injeção de DOM externa ao React. O React re-renderiza o rodapé durante o jogo e pode remover elementos inseridos manualmente.
4. A tentativa anterior também dependia de uma busca case-sensitive por `SAIR`, enquanto a interface renderiza `Sair`.

## Regra de implementação

O botão e a tela de pausa devem fazer parte da árvore React e do fluxo de estado da aplicação. Não usar `MutationObserver`, botão flutuante ou script externo como solução definitiva.

## Fase 1 — UX/UI (`@ux-design-expert` / Uma)

### Entregáveis

- Definir o componente atômico `PauseButton`, reutilizando os tokens visuais existentes:
  - placa metálica;
  - borda escura;
  - tipografia em caixa alta;
  - estados normal, hover/foco e desabilitado;
  - ícone/texto compreensível em telas pequenas.
- Definir a composição do rodapé da Image #2:
  - `PAUSAR` em posição visível antes de `Sair` ou em célula própria;
  - nenhum indicador `Meta`, `Seq` ou `Tempo` deve ser encoberto;
  - preservar leitura em viewport móvel.
- Definir a tela de pausa com a hierarquia da Image #1:
  - estado claramente identificado como `TURNO PAUSADO`;
  - resumo do operador, nível, pontuação, operações, acertos, erros, taxa e integridade;
  - ações `RETOMAR`, `ANÁLISE`, `RANKING`, `MENU` e `REINICIAR`, conforme as funcionalidades já existentes.
- Registrar critérios de acessibilidade:
  - botão com texto acessível;
  - foco visível;
  - contraste equivalente ao sistema visual existente;
  - navegação por teclado.

### Critério de saída da Fase 1

O `@dev` recebe um contrato de interação, estados visuais e posicionamento aprovados, sem introdução de novos padrões visuais fora das referências existentes.

## Fase 2 — Runtime e fonte (`@dev` / Dex)

### Entregáveis

- Escolher uma única fonte de verdade executável, preferencialmente `Arquivos_Diversos/nuclear-challenge-app.tsx`.
- Criar ou restaurar a configuração mínima de execução apenas se ela estiver respaldada pelos artefatos existentes; não inventar framework ou dependências sem validação.
- Implementar estado explícito:

```text
play  -> pause  -> play
pause -> menu / análise / ranking / reiniciar
```

- Criar handlers React `pauseGame` e `resumeGame`.
- Garantir que todos os efeitos do jogo parem em `pause`:
  - timer da rodada;
  - tempo total;
  - aquecimento passivo;
  - cooldowns;
  - alarmes e Geiger;
  - meltdown;
  - atualizações de temperatura.
- Garantir que pausar não:
  - grave a partida;
  - conte erro;
  - altere pontuação;
  - gere timeout;
  - avance ou retroceda fase.
- Renderizar `PauseButton` no rodapé React da partida.
- Renderizar a tela de pausa a partir do mesmo componente/estado da tela de resultado, reutilizando componentes existentes.
- Gerar novamente o artefato distribuído a partir da fonte. Não editar apenas `usina.zip` ou o bundle minificado.

## Fase 3 — Validação funcional

### Cenários obrigatórios

| Cenário | Resultado esperado |
|---|---|
| Iniciar partida | Botão `PAUSAR` aparece no rodapé da Image #2 |
| Pausar sem operação selecionada | Tela de pausa abre e o par de operações permanece intacto |
| Pausar durante uma operação | Resposta, tempo restante e pontuação permanecem intactos |
| Aguardar na pausa | Temperatura, timer, cooldowns e tempo não mudam |
| Retomar | Partida continua do mesmo estado e os timers voltam a avançar |
| Abrir análise/ranking | Navegação funciona sem salvar a partida como encerrada |
| Voltar ao menu | Fluxo existente permanece funcional |
| Reiniciar | Nova partida começa limpa, sem reaproveitar estado pausado |
| Encerrar depois de retomar | Persistência ocorre uma única vez |
| Re-render do jogo | Botão não desaparece |
| Viewport móvel | Botão não cobre `Sair`, `Meta`, `Seq` ou `Tempo` |

## Fase 4 — Gates e evidências

O `@dev` deve entregar:

- fonte alterada;
- artefato distribuído gerado a partir da fonte;
- teste manual no navegador com URL local;
- evidência visual da Image #2 com `PAUSAR`;
- evidência visual da tela pausada;
- resultado de `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` quando o runtime existir.

Se os comandos continuarem impossíveis por ausência de `package.json`, registrar o bloqueio explicitamente e não declarar a implementação como validada.

## Ordem de execução

1. `@ux-design-expert`: fechar componente, layout, estados e acessibilidade.
2. `@dev`: restaurar/identificar runtime, implementar estado React e atualizar fonte.
3. `@dev`: gerar o bundle distribuído.
4. `@ux-design-expert`: revisar a tela no navegador contra as duas referências.
5. `@dev`: corrigir regressões e anexar evidências.
6. `@qa`: validar os cenários e emitir veredito.
7. `@devops`: executar gates de repositório e publicar somente após aprovação.

## Critério de conclusão

O trabalho só será considerado concluído quando o botão estiver visível na partida real, permanecer presente após re-renderizações, abrir a tela de pausa e permitir retomada sem alterar os dados da partida, com o artefato distribuído gerado pela mesma fonte React.

## Status de implementação

- [x] Contrato visual consolidado em `PauseButton` na fonte React.
- [x] Estado `pause` e handlers `pauseGame`/`resumeGame` mantidos no fluxo React.
- [x] Persistência continua limitada a `win`, `lose` e `quit`.
- [ ] Runtime/build do projeto restaurado — bloqueado pela ausência de `package.json`.
- [ ] Bundle distribuído regenerado a partir da fonte — pendente do runtime/build.
- [ ] Validação automatizada e evidência de navegador — pendente do runtime/build.
