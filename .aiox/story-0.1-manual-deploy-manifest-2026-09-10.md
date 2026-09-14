# Story 0.1 — Manifesto de publicação manual

Data: 2026-09-10  
Repositório: https://github.com/SFPTechnology/nuclear-challenge  
Destino: https://usina2.applicationmanager.com.br/  
Mecanismo: File Manager da Hostinger

## Artefato

Publicar **todo o conteúdo de `dist/`**, preservando a estrutura de diretórios. No File Manager, usar o document root efetivo do domínio (normalmente `public_html/`; confirmar no painel antes do upload). Não criar uma camada adicional `dist/`.

| Caminho relativo | Bytes | SHA-256 |
|---|---:|---|
| `index.html` | 525 | `9F9B111AAD98448D5A1397C4A38A0E136BDA0C26C2E3F65877C1D24BA1134B37` |
| `assets/index-BEbCBGL9.css` | 10,174 | `5F3E2EE2FF42FF67D03A368E2FBF18D90E448A8FA8590D8CD9FA8E7313B7C70C` |
| `assets/index-CHCgjhK2.js` | 965,245 | `D43FCFA4BD80929B45593AD94FDB3C861F86698A6EDC04E869C113FB544E2328` |
| `legacy-assets/index-Bh3JlXdk.css` | 17,904 | `50B3A9D16434141E4B7CCBC5169F4D4976E544879910AAA0067B2698EF17B81B` |

## Procedimento manual

1. No Hostinger, abrir o File Manager do domínio `usina2.applicationmanager.com.br` e confirmar o document root.
2. Fazer backup do conteúdo atualmente publicado.
3. Enviar os quatro arquivos de `dist/` para o document root, mantendo `assets/` e `legacy-assets/`.
4. Confirmar que `index.html` aponta para os nomes de assets listados acima.
5. Invalidar cache/CDN, se aplicável, e abrir a URL em janela anônima.

## Verificação de publicação e hashes

Após o upload, baixar da URL pública exatamente:

- `/index.html`
- `/assets/index-CHCgjhK2.js`
- `/assets/index-BEbCBGL9.css`
- `/legacy-assets/index-Bh3JlXdk.css`

Calcular SHA-256 dos bytes baixados (sem conversão de encoding) e comparar com a tabela. A Story 0.1 só pode ser promovida após todos os hashes servidos coincidirem com os hashes do build.

## Evidência T0.1–T0.5

- [ ] **T0.1 — limites de animação:** registrar vídeo da versão publicada; confirmar que `rumble`, `rumbleHard`, `glitch` e `grainShift` respeitam o limite definido na story.
- [ ] **T0.2 — fases/heat:** executar os cenários previstos, incluindo `heat > 72` e `heat >= 90`, na URL publicada; anexar vídeo.
- [ ] **T0.3 — reduced motion:** ativar a preferência do navegador/DevTools; registrar vídeo sem white flash/partículas indevidas e confirmar `onDone` em 4 s.
- [ ] **T0.4 — comportamento padrão:** repetir o fluxo sem reduced motion e anexar vídeo correspondente.
- [ ] **T0.5 — integridade:** anexar tabela dos hashes baixados da URL e a comparação com esta tabela local.

## Estado

Este manifesto prepara a publicação, mas **não constitui evidência de deploy**. Nenhum upload no Hostinger foi executado pelo Codex nesta execução; a publicação e a captura de vídeo dependem da ação manual no File Manager. Até a coleta dos artefatos acima, Story 0.1 permanece `InProgress`.
