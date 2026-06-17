# Control Plane HAL

Angular dashboard for managing infrastructure requests, service health, workflows,
landing zones, and audit events.

## Run

```bash
npm start
```

Open `http://localhost:4200/`. Sign in with any non-empty email and password;
accounts are mocked for development.

## Mock API

`npm start` runs a local mock API server on `http://127.0.0.1:4300`.
The Angular app calls that server directly, so requests are normal
browser-visible HTTP calls in DevTools Network:

- `POST /api/session`
- `GET /api/catalog`
- `GET /api/resources`
- `GET /api/requests`
- `POST /api/requests`
- `GET /api/workflows`
- `GET /api/events`
- `GET /api/landing-zones`

Mock API responses resolve immediately. Submitting an infrastructure request creates
a `LIVE` request, a completed workflow, and a healthy resource in the same response.

## Build

```bash
npm run build
```
