# Fonte do motion "Site Diga Xis"

Animação em HTML com linha do tempo determinística (`render(t)`), renderizada quadro a quadro
com Playwright (30 fps) e codificada com ffmpeg.

- `index.html`: cenas, estilos e linha do tempo (28,5 s, 1080×1920).
- `qr.json`: matriz do QR code de https://digaxis.app (inserida no lugar de `__QR__`).
- `render.js`: `node render.js <pasta> stills 1,6,12` gera quadros de prévia; `node render.js <pasta> video` gera `out.mp4`.

Dependências: as fotos e o logo vêm de `public/` do repositório `regular-alves/xis`
(caminhos `file:///home/user/xis/public/...` no HTML; ajuste se o checkout estiver em outro lugar),
e os arquivos `fraunces.woff2` / `fraunces-italic.woff2` (Google Fonts, licença OFL) ficam na mesma pasta do HTML.
