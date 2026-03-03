# OKR Manager

A simple OKR (Objectives and Key Results) management app built with React, TypeScript, and Vite.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open http://localhost:5173/okr-manager/ in your browser.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Deploy to GitHub Pages

### Option 1: Manual deploy

```bash
npm run build
npx gh-pages -d dist
```

### Option 2: GitHub Actions (automatic)

Create `.github/workflows/deploy.yml` with the workflow in this repo, then every push to `main` will auto-deploy.

After deploying, your app will be live at: https://tolson.github.io/okr-manager/
