# Gestionale Falegname Pro (GitHub Pages ready)

## Avvio locale
```bash
npm install
npm run dev
```

## Build produzione
```bash
npm run build
npm run preview
```

## Deploy GitHub Pages
- Repo: malerba1706-hue/falegname.v2
- Config già inclusa: `vite.config.js` con `base: /falegname.v2/` e workflow `.github/workflows/deploy.yml`.
- Ogni `git push` su `main` pubblica automaticamente su: https://malerba1706-hue.github.io/falegname.v2/
