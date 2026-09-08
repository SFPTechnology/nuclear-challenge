# Plano de execução do Dev — botão Pausar no bundle

## Contexto e causa confirmada

A fonte React declara `PauseButton`, `pauseGame` e `resumeGame`, mas a interface observada é renderizada por `Arquivos_Diversos/usina.zip/assets/index-zV9To2jc.js`. Esse bundle não contém o componente React atualizado.

Na instância local analisada:

```text
GET /                         -> 200
GET /assets/pause.js          -> 404
```

Portanto, o HTML servido não fornece a implementação complementar de pausa, e o bundle compilado permanece sem esse recurso.

## Objetivo

Fazer o botão `PAUSAR` aparecer na partida real e abrir a tela de pausa sem perder o estado da rodada.

## Fonte de verdade

- Lógica React: `Arquivos_Diversos/nuclear-challenge-app.tsx`.
- Referência funcional e visual: `Arquivos_Diversos/handoff-04-codigo.txt` e as imagens fornecidas.
- Artefato distribuído: `Arquivos_Diversos/usina.zip`.

Não tratar `dist/index.html` como equivalente ao bundle React: ele é um artefato estático diferente.

## Etapa 1 — Corrigir a execução local

1. Extrair `Arquivos_Diversos/usina.zip` para uma pasta de preview única.
2. Iniciar o servidor HTTP apontando exatamente para essa pasta extraída.
3. Validar antes de abrir o navegador:

```text
GET /                         = 200
GET /assets/index-zV9To2jc.js = 200
GET /assets/index-Bh3JlXdk.css = 200
GET /assets/pause.js          = 200, caso o HTML o referencie
```

4. Se `pause.js` retornar `404`, interromper a validação: o servidor está apontando para uma cópia desatualizada, uma pasta incorreta ou um pacote que não contém o arquivo.
5. Não reutilizar um servidor iniciado antes de extrair o pacote atualizado. Encerrar o processo antigo e iniciar outro com a nova pasta de preview.

## Etapa 2 — Implementar na árvore React

1. Usar `nuclear-challenge-app.tsx` como fonte.
2. Manter `PauseButton` dentro do rodapé React, antes de `Sair`.
3. Manter a máquina de estados:

```text
play -> pause -> play
pause -> analise | ranking | menu | reiniciar
```

4. `pauseGame` deve:

- parar alarme e Geiger;
- trocar somente o `mode` para `pause`;
- não chamar `saveResult`;
- não reiniciar pontuação, resposta, operação, cooldown ou tempo.

5. `resumeGame` deve restaurar somente `mode: 'play'`.
6. Todos os efeitos que dependem de `mode === 'play'` devem permanecer inativos durante a pausa: timer, tempo total, aquecimento, cooldowns, meltdown e atualização visual da temperatura.
7. Não usar `MutationObserver`, elemento DOM inserido manualmente, botão fixo ou `pause.js` como implementação definitiva.

## Etapa 3 — Restaurar a cadeia de build

1. Localizar os metadados originais do projeto (por exemplo, `package.json`, configuração de bundler e ponto de entrada) nos artefatos disponíveis.
2. Se forem localizados, restaurá-los sem alterar framework, versões ou dependências sem evidência.
3. Gerar o bundle a partir de `nuclear-challenge-app.tsx`.
4. Confirmar que o novo asset compilado contém os textos `PAUSAR`, `TURNO PAUSADO` e `RETOMAR`.
5. Atualizar `usina.zip` apenas com a saída do build, mantendo `index.html` e `assets/` coerentes.

### Gate de bloqueio

Se não houver metadados ou runtime recuperáveis, não editar o bundle minificado como solução final. Registrar o bloqueio e entregar apenas uma preview local controlada com a limitação documentada.

## Etapa 4 — Validação manual obrigatória

| Caso | Evidência esperada |
|---|---|
| Tela de jogo | `PAUSAR` visível ao lado de `Sair`, sem cobrir Meta/Seq/Tempo |
| Pausar antes de escolher operação | Operações continuam iguais após retomar |
| Pausar com resposta digitada | Resposta e tempo restante são preservados |
| Aguardar 10 segundos pausado | Nenhuma métrica, calor, cooldown ou relógio se altera |
| Retomar | Timers voltam a avançar a partir do estado preservado |
| Análise, ranking e menu | Navegação funciona e não grava resultado durante a pausa |
| Reiniciar | Cria uma partida limpa |
| Re-render do jogo | Botão continua visível |

## Etapa 5 — Quality gates e handoff

1. Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` quando o runtime estiver disponível.
2. Atualizar o checklist da story/artefato de plano com resultados reais.
3. Anexar duas capturas: jogo com botão e tela pausada.
4. Informar a URL da preview, a pasta servida e os quatro status HTTP da Etapa 1.

## Critério de conclusão

O trabalho está concluído somente se a interface em execução carregar o botão sem `404`, a pausa preservar integralmente a rodada e o bundle distribuído for gerado pela mesma fonte React que contém a implementação.

## Execução registrada (2026-09-07)

- [x] O `PauseButton` foi mantido no rodapé React, imediatamente antes de `Sair`.
- [x] `pauseGame` interrompe alarme/Geiger e altera o modo para `pause`; `resumeGame` retorna a `play` sem reinicializar a rodada.
- [x] A tela de pausa oferece `RETOMAR` e os acessos existentes a análise, ranking, menu e reinício.
- [x] Foi criada uma cadeia Vite para compilar `Arquivos_Diversos/nuclear-challenge-app.tsx` e gerar o artefato distribuível.
- [x] `Arquivos_Diversos/usina/` e `Arquivos_Diversos/usina.zip` foram atualizados a partir desse build. A implementação não usa `pause.js` nem `MutationObserver`.
- [x] Validações automatizadas concluídas: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
- [x] Preview local em execução: `http://127.0.0.1:4174/` servindo `Arquivos_Diversos/usina/`. HTTP: `/` 200, bundle JavaScript 200, CSS 200; `/assets/pause.js` 404 esperado, pois deixou de ser um recurso da aplicação.

Pendente de validação visual manual no navegador: capturar a tela de jogo com `PAUSAR` e a tela `TURNO PAUSADO`.
