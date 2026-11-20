# Family Cabin Project Management

A private family application for tracking cabin projects and publishing announcements.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB Atlas account or a reachable MongoDB database

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` in the project root from `.env.example`.
3. Replace the MongoDB username and password placeholders and set a long random session secret.
4. In MongoDB Atlas, allow your local development IP through Network Access.

## Run locally

Start the Express API:

```bash
npm run server:dev
```

Start the Astro frontend in another terminal:

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:4321`
- API health check: `http://localhost:3000/api/v1/health`

## Render deployment

This project requires two Render web services:

1. Deploy `family-cabin-api` using `npm ci`, `npm run server:start`, and
   `/api/v1/health`.
2. Deploy `family-cabin` using `npm ci && npm run build` and `npm start`.

Set these environment variables after creating both services:

- API: `MONGODB_URI`, `SESSION_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`
- Frontend: `PUBLIC_API_URL`, `NODE_ENV=production`

`FRONTEND_URL` must be the complete public frontend URL. `PUBLIC_API_URL` must
be the complete public API URL. MongoDB Atlas Network Access must allow Render
to connect.

## Quality checks

```bash
npm test
npm run smoke
npm run lint
npm run format:check
npm run build
npm run audit
```

## Environment variables

- `PUBLIC_API_URL`: browser-accessible Express API URL
- `FRONTEND_URL`: allowed Astro frontend origin
- `PORT`: Express API port
- `MONGODB_URI`: MongoDB Atlas or MongoDB connection string
- `SESSION_SECRET`: secret used to sign session cookies

Never commit `.env` or MongoDB credentials.
