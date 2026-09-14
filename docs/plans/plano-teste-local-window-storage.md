# Plano de implementação — teste local com `window.storage`

## Objetivo

Permitir que o @dev execute o jogo no navegador local antes da hospedagem definitiva, reproduzindo o contrato de armazenamento usado pela aplicação. O teste deve validar o fluxo de salvamento sem depender do Hostinger nem de uma API de produção.

## Restrições obrigatórias

- Não usar `localStorage` ou `sessionStorage`.
- Não alterar o comportamento de produção nem introduzir o mock no build publicado.
- Não criar banco de dados ou dependência externa.
- Preservar a API existente:

```ts
window.storage.get(key: string, global: boolean): Promise<{ value?: string } | null>
window.storage.set(key: string, value: string, global: boolean): Promise<boolean>
```

- O mock deve ser instalado antes da inicialização do React.
- Falhas de leitura devem continuar acionando o aviso e bloqueando gravações, conforme o `StorageAdapter`.

## Implementação exigida do @dev

### 1. Criar um host de storage exclusivo para desenvolvimento

Criar um módulo em `src/dev/localStorageHost.ts` (ou caminho equivalente já usado pelo projeto) que exporte uma função:

```ts
installLocalStorageHost(options?: {
  failGet?: boolean;
  failSet?: boolean;
}): void
```

O módulo deve:

- manter os dados em um `Map<string, string>` em memória;
- implementar `get` e `set` assíncronos;
- retornar `null` quando a chave não existir;
- retornar `{ value }` quando existir;
- retornar `false` ou rejeitar quando o modo de falha correspondente estiver ativado;
- expor `window.storage` somente em desenvolvimento;
- não acessar `window.localStorage` nem `window.sessionStorage`.

### 2. Instalar o host antes do bootstrap

No entrypoint de desenvolvimento, instalar o host antes de importar/renderizar o `App`.

Exemplo de regra de ativação:

```ts
if (import.meta.env.DEV) {
  installLocalStorageHost();
}
```

O mock não pode ser incluído quando `npm run build` gerar o artefato de produção. Se o bundler não permitir garantir isso estaticamente, usar um entrypoint ou script separado para desenvolvimento.

### 3. Permitir reset determinístico do cenário

Adicionar uma função de desenvolvimento, sem botão visível em produção, para limpar o `Map` e reinstalar o estado inicial. O reset deve ser acionável pelo console ou por teste automatizado, por exemplo:

```ts
window.__resetLocalStorageHost?.();
```

Declarar o tipo global somente no código de desenvolvimento/teste.

### 4. Cobrir o contrato com testes automatizados

Criar ou atualizar testes para verificar:

- `get` de chave ausente retorna `null`;
- `set` seguido de `get` retorna exatamente o valor salvo;
- `global` é aceito sem alterar o comportamento;
- `failGet` simula falha de leitura;
- `failSet` simula rejeição de gravação;
- nenhuma chamada usa `localStorage` ou `sessionStorage`.

### 5. Testar o fluxo no navegador

Com o host instalado:

1. Executar `npm run dev`.
2. Abrir a URL local exibida pelo Vite.
3. Confirmar que o aviso **Falha de armazenamento** não aparece na inicialização.
4. Criar ou selecionar um operador.
5. Iniciar uma partida e responder operações.
6. Encerrar por vitória, derrota e botão **Sair**.
7. Confirmar que a tela de resultado fica interativa após o encerramento.
8. Abrir **Análise de Desempenho** e **Ranking**.
9. Confirmar que pontuação, operações, acertos, sequência, vitórias e partida aparecem.
10. Recarregar a página apenas se o host local tiver sido configurado para persistir o `Map` no processo do servidor; caso contrário, registrar que o teste cobre a sessão atual e validar a persistência entre reload no ambiente de homologação.

## Cenários de falha obrigatórios

Executar os mesmos passos com as opções abaixo:

| Cenário | Configuração | Resultado esperado |
|---|---|---|
| Leitura indisponível | `failGet: true` | Aviso visível; nenhuma gravação de `operadores` ou `partidas` |
| Escrita rejeitada | `failSet: true` | Aviso visível após tentativa de salvar |
| Campo desconhecido | inserir campo futuro no registro | campo permanece após `saveResult` |
| Reduced motion | preferência `prefers-reduced-motion: reduce` | explosão estática; `onDone` em 4 s; tela de resultado interativa |
| Movimento normal | preferência desativada | animação completa; `onDone` em 4 s; tela de resultado interativa |

## Comandos de validação

Executar na raiz do projeto:

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

O build deve passar sem incluir o host de desenvolvimento no artefato de produção.

## Evidências a registrar

O @dev deve registrar em um relatório de teste:

- URL e porta locais;
- commit/estado do código testado;
- resultado dos quatro comandos de validação;
- passos e resultado de cada cenário de falha;
- confirmação de que não houve uso de `localStorage`/`sessionStorage`;
- limitações do mock local, especialmente se os dados não sobreviverem a reload;
- arquivos adicionados ou alterados.

## Critério de conclusão

O trabalho está concluído quando o navegador local executa uma partida sem o aviso de armazenamento, salva e exibe o resultado durante a sessão, os cenários de falha permanecem seguros, todos os gates passam e o build de produção não contém o host/mock de desenvolvimento.

Este teste local não substitui a homologação no runtime que fornecerá `window.storage` em produção.
