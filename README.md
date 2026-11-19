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
