# Estrutura de acompanhamento pedagógico

## Referência

Esta documentação descreve a estrutura implementada em [`Arquivos_Diversos/nuclear-challenge-app.tsx`](../Arquivos_Diversos/nuclear-challenge-app.tsx).

O acompanhamento é armazenado por operador e combina:

- histórico acumulado de desempenho;
- registro diário por data local;
- calendário mensal visual;
- ranking de prioridades de estudo.

## Objetivo

Registrar quantas contas o usuário realizou, separando acertos e erros por:

1. dia do mês e dia da semana;
2. tabuada/fator envolvido;
3. operação matemática;
4. formato da pergunta.

O sistema usa esses dados para indicar quais conteúdos devem ser praticados com maior frequência.

## Modelo de dados do operador

Cada operador continua mantendo os campos históricos existentes:

```js
{
  best: {},
  games: 0,
  ops: 0,
  hits: 0,
  streak: 0,
  rank: 0,
  wins: 0,
  stats: {
    tabs: {},
    ops: {},
    forms: {}
  },
  studyLog: {}
}
```

`studyLog` é o novo agrupador diário. A chave segue o formato local `YYYY-MM-DD`, evitando depender do fuso UTC:

```js
studyLog: {
  "2026-09-07": {
    key: "2026-09-07",
    year: 2026,
    month: 8,
    day: 7,
    weekday: 1,
    total: 12,
    hits: 9,
    misses: 3,
    types: {
      multiplication: { hits: 6, misses: 1 },
      division: { hits: 3, misses: 2 },
      direct: { hits: 8, misses: 2 },
      inverse: { hits: 1, misses: 1 }
    },
    tables: {
      "7": { hits: 4, misses: 1 },
      "8": { hits: 5, misses: 2 }
    },
    updatedAt: 1757250000000
  }
}
```

### Campos do dia

| Campo | Descrição |
|---|---|
| `key` | Identificador local do dia, no formato `YYYY-MM-DD`. |
| `year` | Ano do registro. |
| `month` | Mês zero-based do JavaScript: janeiro é `0`. |
| `day` | Dia do mês. |
| `weekday` | Dia da semana retornado por `Date.getDay()`: domingo `0` até sábado `6`. |
| `total` | Total de contas realizadas no dia. |
| `hits` | Quantidade de respostas corretas. |
| `misses` | Quantidade de respostas incorretas. |
| `types` | Desempenho por operação e formato da pergunta. |
| `tables` | Desempenho por fator/tabuada. |
| `updatedAt` | Timestamp da última atualização do registro. |

## Tipos acompanhados

### Operação

- `multiplication`: multiplicação;
- `division`: divisão.

### Formato da pergunta

- `direct`: resultado oculto, por exemplo `7 × 8 = ?`;
- `inverse`: um fator oculto, por exemplo `? × 8 = 56` ou `7 × ? = 56`.

Cada tipo possui sempre o mesmo formato de contagem:

```js
{ hits: 0, misses: 0 }
```

## Fluxo de registro

1. Ao responder uma conta, a função `bump(q, hit)` registra o resultado na sessão atual.
2. O resultado é acumulado em `tabs`, `ops` e `forms`, preservando a análise histórica existente.
3. O mesmo resultado é associado ao dia local atual em `sess.current.daily`.
4. Para cada conta, são atualizados:
   - `total`;
   - `hits` ou `misses`;
   - operação;
   - formato direto/inverso;
   - todos os fatores envolvidos.
5. Ao terminar, vencer ou abandonar uma partida, `saveResult` combina o registro da sessão com o `studyLog` persistido.
6. A persistência continua usando `window.storage`, na chave `operadores`.

O registro diário é consolidado no encerramento da partida. Uma partida interrompida antes de ser salva não gera um novo registro permanente.

## Compatibilidade com dados legados

Operadores antigos que ainda não possuem `studyLog` continuam válidos. O código utiliza um objeto vazio como fallback e cria o primeiro registro diário somente quando houver novos resultados.

O campo `stats` anterior não é removido nem reformatado. Isso mantém compatibilidade com a análise histórica, ranking e partidas já armazenadas.

## Calendário mensal

A tela **Análise de Desempenho** apresenta o bloco **Registro de treino**.

O calendário:

- inicia no mês atual;
- permite navegar para o mês anterior e o próximo mês;
- organiza os dias em sete colunas, de domingo a sábado;
- exibe o número do dia;
- exibe `acertos/total` nos dias com atividade;
- colore cada dia de acordo com o percentual de acerto;
- mostra o total de contas e o percentual mensal abaixo da grade.

Dias sem registro permanecem visíveis, mas com menor contraste. Isso permite perceber lacunas de prática sem confundir ausência de estudo com baixo desempenho.

## Cores de desempenho

O calendário reutiliza a escala visual da análise:

| Percentual de acerto | Leitura visual |
|---:|---|
| abaixo de 40% | crítico/vermelho |
| 40% a 59% | atenção laranja |
| 60% a 79% | atenção âmbar |
| 80% a 89% | bom desempenho verde-lima |
| 90% ou mais | domínio consolidado verde |

## Priorização de estudo

O bloco **Prioridade de estudo** combina registros diários de todos os dias disponíveis e apresenta até seis itens.

São considerados:

- cada tabuada/fator com pelo menos duas tentativas;
- multiplicação;
- divisão;
- conta direta;
- conta inversa.

Para cada item são calculados:

```text
total = hits + misses
accuracy = arredondar((hits / total) × 100)
```

### Ordem aplicada

Os itens são ordenados por:

1. maior quantidade absoluta de erros;
2. menor percentual de acerto;
3. maior volume total de tentativas.

Essa ordem favorece conteúdos que mais prejudicam o desempenho e evita que uma taxa baixa baseada em apenas uma tentativa domine a lista.

O indicador visual mostra a parcela de erro:

```text
percentual visual de reforço = 100 - accuracy
```

## Diretrizes de UX/UI

- O calendário mantém a mesma linguagem visual do painel industrial.
- A navegação mensal usa controles pequenos e fáceis de localizar.
- A informação principal do mês fica no cabeçalho e no resumo inferior.
- A prioridade usa ranking numerado para indicar sequência de estudo.
- Os dois primeiros itens recebem destaque de alerta maior.
- A taxa e a quantidade de erros aparecem juntas, evitando interpretação baseada somente em percentual.
- Dias sem atividade continuam no calendário para tornar a regularidade de estudo visível.
- A estrutura funciona dentro do shell responsivo mobile/tablet/desktop já existente.

## Limites atuais

- O registro é salvo ao finalizar a partida, não a cada resposta individual.
- O ranking de prioridade considera os dados acumulados, não aplica decaimento temporal.
- `updatedAt` é armazenado para permitir evolução futura por recência, mas não participa da ordenação atual.
- O armazenamento depende de `window.storage`; sem esse serviço, os dados podem ficar apenas na sessão atual.

## Pontos de manutenção no código

| Responsabilidade | Elementos principais |
|---|---|
| Criar chave de data | `localDay` |
| Criar registro vazio | `emptyStudyDay` |
| Consolidar dias | `mergeStudyLog` |
| Registrar cada resposta | `bump` |
| Persistir ao concluir partida | `saveResult` |
| Controlar mês exibido | `calendarCursor` |
| Renderizar calendário | bloco `Registro de treino` |
| Calcular prioridades | constante `priority` na tela de análise |
