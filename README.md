# my-portfolio

Portfólio pessoal de Eduardo Sousa, com visual inspirado em jogos (tela de start, "quests", barras de status).

No ar em **https://eduardomssousa.com.br**

## Funcionalidades

- Textos em português e inglês: escolhe pelo idioma do navegador e o botão PT/EN troca e lembra a escolha.
- Tema claro e escuro, salvo no navegador.
- Projetos ("Quests") e estatísticas de linguagens carregados ao vivo da API do GitHub (`sousax`), com cache de 10 minutos na sessão. Só entram os repositórios com o tópico `portfolio`; sem nenhum marcado, aparecem os 6 mais recentes com descrição.
- Capturas de tela em `src/assets/quests/<repo>.webp`; sem arquivo, usa uma captura da homepage do projeto via thum.io.
- Formulário de contato via Formspree, protegido por Cloudflare Turnstile.
- Currículo para download em português e inglês (`public/`).

## Tecnologias

- React 19 + Vite
- TypeScript (entrada) e JSX, CSS próprio (`src/components.css`, `src/index.css`)
- GitHub Pages (deploy via GitHub Actions, domínio próprio em `CNAME`)

## Como rodar

Requer Node 22 (mesma versão do workflow de deploy).

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # tsc -b && vite build -> dist/
npm run preview   # serve o build localmente
npm run lint
```

## Deploy

Todo push na `main` dispara `.github/workflows/deploy.yml`, que roda `npm ci && npm run build` e publica `dist/` no GitHub Pages.
