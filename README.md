# MasterMap Monorepo

![CI](https://github.com/vasily19921992/hhhhmap/actions/workflows/ci.yml/badge.svg)

Monorepo with:
- `apps/web` - React + Vite frontend
- `apps/api` - Express API
- `apps/pocketbase` - PocketBase app

## Requirements

- Node.js 20+
- npm 10+

## Local setup

1. Install dependencies:
   - `npm install`
2. Create API env:
   - copy `apps/api/.env.example` to `apps/api/.env`
   - fill real values (especially `ETHERSCAN_API_KEY`, `PB_SUPERUSER_EMAIL`, `PB_SUPERUSER_PASSWORD`)
3. Start development:
   - `npm run dev`

## Useful scripts

- `npm run dev` - runs web + api + pocketbase
- `npm run build` - builds web app
- `npm run start` - starts api + pocketbase
- `npm run lint` - runs lint for web + api

## Deploy to GitHub

1. Initialize git (if needed):
   - `git init`
2. Create repository on GitHub (without README/license/gitignore).
3. Connect remote:
   - `git remote add origin https://github.com/vasily19921992/hhhhmap.git`
4. Commit and push:
   - `git add .`
   - `git commit -m "chore: prepare repository for github deployment"`
   - `git branch -M main`
   - `git push -u origin main`

## Security notes

- Keep `apps/api/.env` private.
- Never commit real API keys or passwords.
