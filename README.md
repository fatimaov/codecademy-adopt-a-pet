# Adopt a Pet

This app uses The Dog API and The Cat API through a local Node proxy server. The React client talks to local `/api/thedogapi/*` and `/api/thecatapi/*` routes, and the server attaches the API keys so they do not ship to the browser.

## Environment setup

Create a local `.env` file from `.env.example` and add your API keys:

```bash
cp .env.example .env
```

Set:

- `THEDOG_API_KEY`
- `THECAT_API_KEY`
- `API_PORT` (optional, defaults to `3002`)

## Run locally

```bash
npm install
npm start
```

`npm start` runs both:

- the React dev server on `http://localhost:3001`
- the API proxy on `http://localhost:3002`

## Optional mock mode

If you still want the old MSW mock behavior for local UI work, start the client with:

```bash
REACT_APP_USE_MOCKS=true npm run start:client
```

In mock mode, the React app enables `src/mocks/browser.js` again instead of relying on the real API.
