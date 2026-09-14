# Inventario visual - Nuclear Challenge

Fonte: `Arquivos_Diversos/nuclear-challenge-app.tsx`
Destino: `src/`
Data do inventario: 2026-09-10

## Direcao visual

- Fundo: radial escuro, quase preto, com temperatura industrial.
- Superficie: placas metalicas em gradiente cinza, borda escura, relevo externo e recessos internos.
- LCD: fundo quase preto, sombra interna, texto ciano/azul claro e dados monoespacados.
- Hierarquia cromatica: ciano para informacao e acao primaria; amber para prioridade e atencao; vermelho para risco e falha; verde para sucesso e normalidade; cinza para suporte.
- Tipografia: labels compactos em caixa alta com espacamento de letras; valores e operacoes em fonte monoespacada; titulos curtos e densos.
- Textura e movimento: grain/vignette, lampPulse, rumble e alertas de evento; todos devem respeitar `prefers-reduced-motion`.

## Mapa de telas

| Tela | Hierarquia e informacoes | Componentes destino |
|---|---|---|
| Login | Cabecalho USINA NUCLEAR, identificacao, novo cracha, lista/contagem de operadores, estado vazio, selecao, exclusao e comparacao | `LoginPanel`, `Plate`, `Label`, `EmptyState`, `OperatorExclusionDialog` |
| Menu | Operador, titulo, acoes ANALISE/RANKING/TROCAR, seis niveis com descricao, recorde e tempo, audio e INICIAR | `MenuPanel`, `Plate`, `Label`, `Lcd` |
| Jogo | Barra UN-01/rank/status, gauge de temperatura, Integr/Refrig/Potencia, lampadas, valvulas, escolha de operacao ou LCD de resposta, teclado e META/SEQ/TEMPO | `GamePlayPanel`, `CoreGauge`, `Support`, `Lamp`, `Valve`, `Plate`, `Label`, `PreMelt`, `Ambient` |
| Ranking | Cabecalho, abas por visao, ranking de operadores, registros de partidas, medalhas, pontos, acerto, sequencia e empty states | `RankingPanel`, `Plate`, `Label`, `EmptyState` |
| Analise | Cabecalho do operador, total de operacoes, mapa de tabuadas, acerto por tabuada, reforco prioritario, dominio, multiplicacao/divisao, formato da pergunta e retorno | `AnalisePanel`, `Plate`, `Label`, `EmptyState` |
| Fim de jogo | Estado REATOR ESTABILIZADO/MELTDOWN/TURNO ENCERRADO, rank, promocao, relatorio com operador/nivel/titulo/tempo/pontuacao/recorde/operacoes/acerto/sequencia/integridade e navegacao | `EndGamePanel`, `Plate`, `Label`, `EmptyState` |
| Pausa/erro | Estado interrompido com retomada ou recuperacao, sem perder contexto e com anuncio acessivel | `EndGamePanel`, `ErrorBoundary`, `GlobalErrorBanner` |

## Primitives e tokens

- `Plate`: placa metalica, sombra raised e opcional glow.
- `Label`: texto de apoio compacto, com tamanhos em rem.
- `Lcd`: leitura de valor/unidade em superficie rebaixada.
- `Lamp`: indicador ligado/desligado com label textual.
- `CoreGauge`: leitura principal da temperatura, delta e estados danger/frozen.
- `MetricBadge`/`Support`: metrica compacta com percentual e indicador sem depender apenas de cor.
- `Valve`: controle de acao operacional com label, subtexto, cooldown e disabled.
- Tokens necessarios: `colors`, `typography`, `shadows`, `borders`, `presets`, `breakpoints`, `transitions` e estados semanticos.

## Estados a verificar

- Sem operadores, carregando e erro de armazenamento no Login.
- Sem partidas no Menu/Ranking/Analise.
- Jogo antes de escolher operacao, resposta digitada, resposta correta, erro, timeout, cooldown, frozen, alerta de temperatura e meltdown.
- Pausa com retomada.
- Vitoria com promocao e sem promocao.
- Derrota e encerramento manual.
- Texto ampliado, teclado, foco visivel, reduced motion e larguras de 320px a desktop.

## Correspondencia de informacoes

O prototipo e referencia de composicao, rotulos e densidade. O valor real das metricas deve continuar vindo de props e hooks existentes em `src/`; nenhum dado estatico do prototipo deve substituir estado persistido ou calculado.
