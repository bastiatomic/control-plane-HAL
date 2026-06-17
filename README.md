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

The app uses an Angular `HttpInterceptorFn` to serve development endpoints:

- `POST /api/session`
- `GET /api/catalog`
- `GET /api/resources`
- `GET /api/requests`
- `POST /api/requests`
- `GET /api/workflows`
- `GET /api/events`
- `GET /api/landing-zones`

Workflow progress is recalculated on each `/api/workflows` request so long-running
automation visibly moves while the app is open.

## Build

```bash
npm run build
```
