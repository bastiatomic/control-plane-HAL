import { createServer } from 'node:http';

const host = process.env.MOCK_API_HOST || '127.0.0.1';
const port = Number(process.env.MOCK_API_PORT || 4300);
const jsonHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};
const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString();

const catalog = [
  {
    id: 'postgres-managed',
    name: 'Managed PostgreSQL',
    category: 'Data',
    summary: 'Encrypted database with backups, patch windows, and replica options.',
    owner: 'Database platform',
    deliveryTime: '45-90 min',
    risk: 'Medium',
    status: 'AVAILABLE',
    tags: ['backup', 'encrypted', 'production-ready'],
    cues: ['Requires data classification', 'Auto-creates monitoring checks'],
  },
  {
    id: 'kubernetes-namespace',
    name: 'Kubernetes Namespace',
    category: 'Compute',
    summary: 'Team-scoped namespace with RBAC, network policy, and deployment pipeline.',
    owner: 'Container platform',
    deliveryTime: '15-30 min',
    risk: 'Low',
    status: 'AVAILABLE',
    tags: ['rbac', 'policy', 'ci-ready'],
    cues: ['Includes default quotas', 'Requires owning repository'],
  },
  {
    id: 'landing-zone',
    name: 'Cloud Landing Zone',
    category: 'Foundation',
    summary: 'Account baseline with guardrails, logging, and repo wiring.',
    owner: 'Cloud foundations',
    deliveryTime: '1-2 days',
    risk: 'High',
    status: 'RESTRICTED',
    tags: ['network', 'guardrails', 'compliance'],
    cues: ['Approval required', 'Security baseline enforced'],
  },
  {
    id: 'secrets-vault',
    name: 'Secrets Vault',
    category: 'Security',
    summary: 'Namespace for secrets, rotation policies, and service identity bindings.',
    owner: 'Security platform',
    deliveryTime: '30-60 min',
    risk: 'Medium',
    status: 'AVAILABLE',
    tags: ['rotation', 'identity', 'audit'],
    cues: ['Rotation policy mandatory', 'Audit events retained'],
  },
];

let resources = [
  {
    id: 'res-101',
    name: 'payments-prod-db',
    team: 'Payments',
    service: 'Managed PostgreSQL',
    environment: 'Production',
    lifecycle: 'LIVE',
    health: 'Healthy',
    cicd: 'Passing',
    drift: 'None',
    version: '15.6.2',
    alerts: 0,
    diagnostic: 'All backups completed within the policy window.',
    remediation: 'No action required.',
    updatedAt: ago(8),
  },
  {
    id: 'res-102',
    name: 'commerce-web-namespace',
    team: 'Commerce',
    service: 'Kubernetes Namespace',
    environment: 'Production',
    lifecycle: 'DEGRADED',
    health: 'Warning',
    cicd: 'Running',
    drift: 'Detected',
    version: '1.31-baseline.4',
    alerts: 2,
    diagnostic: 'CPU quota is above approved baseline after a manual cluster edit.',
    remediation: 'Review drift PR #482 and apply the generated quota patch.',
    updatedAt: ago(13),
  },
  {
    id: 'res-103',
    name: 'identity-vault',
    team: 'Identity',
    service: 'Secrets Vault',
    environment: 'Production',
    lifecycle: 'PENDING',
    health: 'Warning',
    cicd: 'Blocked',
    drift: 'Suppressed',
    version: '1.18.0',
    alerts: 1,
    diagnostic: 'Rotation policy needs security approval before rollout.',
    remediation: 'Approver can clear SEC-219 or select the standard rotation profile.',
    updatedAt: ago(4),
  },
];

let requests = [
  {
    id: 'REQ-2218',
    name: 'analytics-lz',
    serviceId: 'landing-zone',
    serviceName: 'Cloud Landing Zone',
    requester: 'Mira Patel',
    team: 'Analytics',
    environment: 'Production',
    status: 'REQUIRES_APPROVAL',
    model: 'kind: LandingZone\nname: analytics-lz\nenvironment: production',
    createdAt: ago(45),
  },
  {
    id: 'REQ-2217',
    name: 'identity-vault',
    serviceId: 'secrets-vault',
    serviceName: 'Secrets Vault',
    requester: 'Owen Shaw',
    team: 'Identity',
    environment: 'Production',
    status: 'PENDING',
    model: 'kind: VaultNamespace\nname: identity-vault\nrotation: standard',
    createdAt: ago(22),
  },
];

let workflows = [
  {
    id: 'WF-873',
    title: 'Provision identity-vault',
    target: 'identity-vault',
    status: 'completed',
    progress: 100,
    startedAt: ago(21),
    durationMs: 90_000,
    currentStep: 'Completed',
    owner: 'Security platform',
    nextAction: 'No action required.',
  },
  {
    id: 'WF-872',
    title: 'Reconcile commerce-web-namespace',
    target: 'commerce-web-namespace',
    status: 'completed',
    progress: 100,
    startedAt: ago(9),
    durationMs: 780_000,
    currentStep: 'Completed',
    owner: 'Container platform',
    nextAction: 'No action required.',
  },
];

let events = [
  {
    id: 'EVT-9004',
    timestamp: ago(3),
    severity: 'warning',
    source: 'Drift detector',
    message: 'Drift detected on commerce-web-namespace quota.',
    diagnostic: 'Actual CPU limit is 24 cores; declared limit is 18 cores.',
    remediation: 'Apply PR #482 or accept the generated model update.',
  },
  {
    id: 'EVT-9003',
    timestamp: ago(6),
    severity: 'info',
    source: 'Workflow engine',
    message: 'Workflow WF-873 paused for security approval.',
    diagnostic: 'The policy gate SEC-219 is mandatory for production vaults.',
    remediation: 'Approver can approve SEC-219 from the approvals view.',
  },
];

const landingZones = [
  {
    id: 'lz-001',
    name: 'commerce-prod',
    owner: 'Commerce',
    cloud: 'AWS',
    lifecycle: 'LIVE',
    repos: ['commerce/landing-zone', 'commerce/platform-services'],
    pullRequests: [
      {
        id: '#482',
        title: 'Reconcile namespace quota',
        status: 'Open',
        age: '9 min',
        reviewer: 'Container platform',
      },
    ],
    diagnostic: 'No account-level alerts. One workload drift PR is open.',
  },
  {
    id: 'lz-002',
    name: 'analytics-prod',
    owner: 'Analytics',
    cloud: 'Azure',
    lifecycle: 'REQUIRES_APPROVAL',
    repos: ['analytics/landing-zone', 'analytics/data-platform'],
    pullRequests: [
      {
        id: '#144',
        title: 'Add production network exception',
        status: 'Changes requested',
        age: '42 min',
        reviewer: 'Cloud foundations',
      },
    ],
    diagnostic: 'Blocked by network exception review.',
  },
];

const initialState = cloneState({
  catalog,
  resources,
  requests,
  workflows,
  events,
  landingZones,
});

const scenarios = [
  {
    id: 'happy',
    label: 'Happy case',
    summary: 'Full dashboard data, multi-role user, and successful request creation.',
  },
  {
    id: 'empty',
    label: 'Zero items',
    summary: 'All collection endpoints return empty arrays so empty states can be checked.',
  },
  {
    id: 'no-permissions',
    label: 'No permissions',
    summary: 'Login returns a read-only audit user and request creation is forbidden.',
  },
  {
    id: 'error',
    label: 'Error case',
    summary: 'Dashboard data endpoints return 503 errors while health and login still work.',
  },
];
const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));
const dataFailurePaths = new Set([
  'GET /api/catalog',
  'GET /api/resources',
  'GET /api/requests',
  'POST /api/requests',
  'GET /api/workflows',
  'GET /api/events',
  'GET /api/landing-zones',
]);
const endpointDefinitions = [
  { method: 'GET', path: '/api/health', label: 'Health' },
  { method: 'POST', path: '/api/session', label: 'Session' },
  { method: 'GET', path: '/api/catalog', label: 'Catalog' },
  { method: 'GET', path: '/api/resources', label: 'Resources' },
  { method: 'GET', path: '/api/requests', label: 'Requests' },
  { method: 'POST', path: '/api/requests', label: 'Create request' },
  { method: 'GET', path: '/api/workflows', label: 'Workflows' },
  { method: 'GET', path: '/api/events', label: 'Events' },
  { method: 'GET', path: '/api/landing-zones', label: 'Landing zones' },
];
let activeScenario = 'happy';

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);

  if (request.method === 'OPTIONS') {
    send(response, null, 204);
    return;
  }

  try {
    await route(request, response, url);
  } catch (error) {
    send(response, { message: error.message || 'Mock API error.' }, 500);
  }
});

server.listen(port, host, () => {
  console.log(`Mock API listening on http://${host}:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

async function route(request, response, url) {
  const path = url.pathname;

  if (request.method === 'GET' && (path === '/' || path === '/mock')) {
    sendHtml(response, mockConsoleHtml());
  } else if (request.method === 'GET' && path === '/api/mock') {
    send(response, mockConsoleState(url.origin));
  } else if (request.method === 'POST' && path === '/api/mock/scenario') {
    await handleScenarioChange(request, response, url.origin);
  } else if (request.method === 'POST' && path === '/api/mock/reset') {
    resetMutableState();
    send(response, mockConsoleState(url.origin));
  } else if (request.method === 'GET' && path === '/api/health') {
    send(response, { ok: true });
  } else if (request.method === 'POST' && path === '/api/session') {
    await handleSession(request, response);
  } else if (request.method === 'GET' && path === '/api/catalog') {
    sendScenarioResponse(request, response, currentCatalog());
  } else if (request.method === 'GET' && path === '/api/resources') {
    sendScenarioResponse(request, response, resources);
  } else if (request.method === 'GET' && path === '/api/requests') {
    sendScenarioResponse(request, response, sortByDate(requests, 'createdAt'));
  } else if (request.method === 'POST' && path === '/api/requests') {
    await handleInfrastructureRequest(request, response);
  } else if (request.method === 'GET' && path === '/api/workflows') {
    sendScenarioResponse(request, response, workflows);
  } else if (request.method === 'GET' && path === '/api/events') {
    sendScenarioResponse(request, response, sortByDate(events, 'timestamp'));
  } else if (request.method === 'GET' && path === '/api/landing-zones') {
    sendScenarioResponse(request, response, currentLandingZones());
  } else {
    send(response, { message: `No mock endpoint for ${request.method} ${path}` }, 404);
  }
}

async function handleSession(request, response) {
  const body = await readJson(request);

  if (!body.email || !body.password) {
    send(response, { message: 'Email and password are required.' }, 400);
    return;
  }

  send(response, scenarioUser(body.email));
}

async function handleInfrastructureRequest(request, response) {
  const failure = scenarioFailureFor(request.method, '/api/requests');

  if (failure) {
    send(response, failure.body, failure.status);
    return;
  }

  if (activeScenario === 'no-permissions') {
    send(response, { message: 'Read-only audit users cannot submit infrastructure requests.' }, 403);
    return;
  }

  const body = await readJson(request);
  const service = currentCatalog().find((item) => item.id === body.serviceId);

  if (!body.name || !body.model || !body.environment || !service) {
    send(response, { message: 'A name, service, environment, and model are required.' }, 422);
    return;
  }

  const createdAt = new Date().toISOString();
  const requestRecord = {
    id: `REQ-${2219 + requests.length}`,
    name: body.name,
    serviceId: service.id,
    serviceName: service.name,
    requester: 'Current user',
    team: 'Platform consumers',
    environment: body.environment,
    status: 'LIVE',
    model: body.model,
    createdAt,
  };
  const workflow = {
    id: `WF-${874 + workflows.length}`,
    title: `Provision ${body.name}`,
    target: body.name,
    status: 'completed',
    progress: 100,
    startedAt: createdAt,
    durationMs: 0,
    currentStep: 'Completed',
    owner: service.owner,
    nextAction: 'No action required.',
  };
  const resource = {
    id: `res-${106 + resources.length}`,
    name: body.name,
    team: 'Platform consumers',
    service: service.name,
    environment: body.environment,
    lifecycle: 'LIVE',
    health: 'Healthy',
    cicd: 'Passing',
    drift: 'None',
    version: 'mock-current',
    alerts: 0,
    diagnostic: 'Provisioned immediately by the mock API.',
    remediation: 'No action required.',
    updatedAt: createdAt,
  };
  const event = {
    id: `EVT-${9005 + events.length}`,
    timestamp: createdAt,
    severity: 'success',
    source: 'Request API',
    message: `${requestRecord.id} completed for ${service.name}.`,
    diagnostic: 'Mock API completed the declarative request immediately.',
    remediation: workflow.nextAction,
  };

  requests = [requestRecord, ...requests];
  workflows = [workflow, ...workflows];
  resources = [resource, ...resources];
  events = [event, ...events];

  send(response, { request: requestRecord, workflow }, 201);
}

async function handleScenarioChange(request, response, origin) {
  const body = await readJson(request);

  if (!scenarioIds.has(body.scenario)) {
    send(
      response,
      {
        message: `Unknown mock scenario "${body.scenario}".`,
        supportedScenarios: [...scenarioIds],
      },
      400,
    );
    return;
  }

  activeScenario = body.scenario;
  resetMutableState();
  send(response, mockConsoleState(origin));
}

function sendScenarioResponse(request, response, body) {
  const failure = scenarioFailureFor(request.method, new URL(request.url ?? '/', `http://${host}:${port}`).pathname);

  if (failure) {
    send(response, failure.body, failure.status);
    return;
  }

  send(response, body);
}

function scenarioFailureFor(method, path) {
  if (activeScenario !== 'error' || !dataFailurePaths.has(`${method} ${path}`)) {
    return null;
  }

  return {
    status: 503,
    body: {
      message: 'Mock scenario "Error case" is returning a dashboard data failure.',
      scenario: activeScenario,
      endpoint: `${method} ${path}`,
    },
  };
}

function currentCatalog() {
  return activeScenario === 'empty' ? [] : clone(initialState.catalog);
}

function currentLandingZones() {
  return activeScenario === 'empty' ? [] : clone(initialState.landingZones);
}

function resetMutableState() {
  resources = activeScenario === 'empty' ? [] : clone(initialState.resources);
  requests = activeScenario === 'empty' ? [] : clone(initialState.requests);
  workflows = activeScenario === 'empty' ? [] : clone(initialState.workflows);
  events = activeScenario === 'empty' ? [] : clone(initialState.events);
}

function scenarioUser(email) {
  const user = {
    name: nameFromEmail(email),
    email,
    team: 'Platform consumers',
    roles: ['Platform admin', 'Team admin', 'Approver', 'Read-only audit'],
    activeRole: 'Team admin',
  };

  if (activeScenario !== 'no-permissions') {
    return user;
  }

  return {
    ...user,
    team: 'Audit consumers',
    roles: ['Read-only audit'],
    activeRole: 'Read-only audit',
  };
}

function mockConsoleState(origin) {
  return {
    activeScenario,
    apiBaseUrl: `${origin}/api`,
    appUrl: 'http://127.0.0.1:4200/',
    scenarios,
    notes: [
      'Scenario changes apply immediately to the mock API endpoints.',
      'The dashboard keeps the signed-in user in local storage. Sign out and sign in again after switching to No permissions.',
    ],
    endpoints: endpointDefinitions.map((endpoint) => {
      const preview = previewResponse(endpoint.method, endpoint.path);

      return {
        ...endpoint,
        status: preview.status,
        body: preview.body,
        href: endpoint.method === 'GET' ? endpoint.path : null,
      };
    }),
  };
}

function previewResponse(method, path) {
  const failure = scenarioFailureFor(method, path);

  if (failure) {
    return failure;
  }

  if (method === 'GET' && path === '/api/health') {
    return { status: 200, body: { ok: true } };
  }

  if (method === 'POST' && path === '/api/session') {
    return { status: 200, body: scenarioUser('mira.patel@example.com') };
  }

  if (method === 'GET' && path === '/api/catalog') {
    return { status: 200, body: currentCatalog() };
  }

  if (method === 'GET' && path === '/api/resources') {
    return { status: 200, body: resources };
  }

  if (method === 'GET' && path === '/api/requests') {
    return { status: 200, body: sortByDate(requests, 'createdAt') };
  }

  if (method === 'POST' && path === '/api/requests') {
    return previewRequestCreation();
  }

  if (method === 'GET' && path === '/api/workflows') {
    return { status: 200, body: workflows };
  }

  if (method === 'GET' && path === '/api/events') {
    return { status: 200, body: sortByDate(events, 'timestamp') };
  }

  if (method === 'GET' && path === '/api/landing-zones') {
    return { status: 200, body: currentLandingZones() };
  }

  return { status: 404, body: { message: `No mock endpoint for ${method} ${path}` } };
}

function previewRequestCreation() {
  if (activeScenario === 'no-permissions') {
    return {
      status: 403,
      body: { message: 'Read-only audit users cannot submit infrastructure requests.' },
    };
  }

  const service = currentCatalog()[0];

  if (!service) {
    return {
      status: 422,
      body: { message: 'A name, service, environment, and model are required.' },
    };
  }

  const createdAt = new Date().toISOString();
  const requestRecord = {
    id: 'REQ-preview',
    name: 'preview-service',
    serviceId: service.id,
    serviceName: service.name,
    requester: 'Current user',
    team: 'Platform consumers',
    environment: 'Development',
    status: 'LIVE',
    model: 'kind: MockPreview\nmetadata:\n  name: preview-service',
    createdAt,
  };
  const workflow = {
    id: 'WF-preview',
    title: 'Provision preview-service',
    target: 'preview-service',
    status: 'completed',
    progress: 100,
    startedAt: createdAt,
    durationMs: 0,
    currentStep: 'Completed',
    owner: service.owner,
    nextAction: 'No action required.',
  };

  return { status: 201, body: { request: requestRecord, workflow } };
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function send(response, body, status = 200) {
  response.writeHead(status, jsonHeaders);

  if (status === 204) {
    response.end();
    return;
  }

  response.end(JSON.stringify(body));
}

function sendHtml(response, html, status = 200) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/html; charset=utf-8',
  });
  response.end(html);
}

function mockConsoleHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>HAL Mock API Console</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f7f9;
        --panel: #ffffff;
        --text: #17202a;
        --muted: #5f6b7a;
        --line: #d9e0e8;
        --accent: #0f766e;
        --accent-soft: #e6f5f2;
        --danger: #b42318;
        --warning: #a15c00;
        --ok: #166534;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: var(--bg);
        color: var(--text);
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
      }

      button,
      input,
      select,
      textarea {
        font: inherit;
      }

      .shell {
        display: grid;
        gap: 22px;
        margin: 0 auto;
        max-width: 1240px;
        padding: 28px;
      }

      .topbar,
      .toolbar,
      .scenario-grid,
      .endpoint-grid {
        display: grid;
        gap: 14px;
      }

      .topbar {
        align-items: end;
        grid-template-columns: minmax(0, 1fr) auto;
      }

      h1,
      h2,
      h3,
      p {
        margin: 0;
      }

      h1 {
        font-size: 30px;
        letter-spacing: 0;
        line-height: 1.15;
      }

      h2 {
        font-size: 18px;
        letter-spacing: 0;
      }

      .eyebrow {
        color: var(--accent);
        font-size: 12px;
        font-weight: 760;
        margin-bottom: 6px;
        text-transform: uppercase;
      }

      .copy,
      .note,
      .meta {
        color: var(--muted);
        line-height: 1.5;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
      }

      a,
      button {
        border-radius: 6px;
      }

      a {
        color: var(--accent);
        font-weight: 700;
        text-decoration: none;
      }

      button,
      .link-button {
        align-items: center;
        background: var(--panel);
        border: 1px solid var(--line);
        color: #344054;
        cursor: pointer;
        display: inline-flex;
        justify-content: center;
        min-height: 38px;
        padding: 0 12px;
      }

      button:hover,
      .link-button:hover {
        border-color: #99d8cf;
      }

      button.primary {
        background: var(--accent);
        border-color: var(--accent);
        color: #ffffff;
        font-weight: 760;
      }

      .panel,
      .scenario-card,
      .endpoint-card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .panel {
        display: grid;
        gap: 14px;
        padding: 18px;
      }

      .scenario-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .scenario-card {
        display: grid;
        gap: 12px;
        min-width: 0;
        padding: 16px;
      }

      .scenario-card.active {
        background: var(--accent-soft);
        border-color: #87d1c7;
      }

      .scenario-card h3 {
        font-size: 16px;
        letter-spacing: 0;
      }

      .scenario-card button {
        width: max-content;
      }

      .scenario-card.active button {
        background: #ffffff;
        border-color: #87d1c7;
        color: var(--accent);
        font-weight: 760;
      }

      .note-list {
        display: grid;
        gap: 8px;
        margin: 0;
        padding-left: 18px;
      }

      .endpoint-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .endpoint-card {
        display: grid;
        gap: 12px;
        min-width: 0;
        padding: 16px;
      }

      .endpoint-head {
        align-items: start;
        display: flex;
        gap: 12px;
        justify-content: space-between;
      }

      .endpoint-title {
        display: grid;
        gap: 4px;
        min-width: 0;
      }

      .method,
      .status {
        border-radius: 999px;
        display: inline-flex;
        font-size: 12px;
        font-weight: 760;
        justify-content: center;
        min-height: 24px;
        padding: 4px 9px;
        white-space: nowrap;
      }

      .method {
        background: #eef2f7;
        color: #344054;
      }

      .status.ok {
        background: #dcfce7;
        color: var(--ok);
      }

      .status.warn {
        background: #fef3c7;
        color: var(--warning);
      }

      .status.error {
        background: #fee2e2;
        color: var(--danger);
      }

      code {
        color: #344054;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      pre {
        background: #101828;
        border-radius: 8px;
        color: #e6edf7;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
        font-size: 12px;
        line-height: 1.5;
        margin: 0;
        max-height: 360px;
        overflow: auto;
        padding: 14px;
      }

      .empty {
        color: var(--muted);
        padding: 12px 0;
      }

      @media (max-width: 900px) {
        .shell {
          padding: 18px;
        }

        .topbar {
          grid-template-columns: 1fr;
        }

        .actions {
          justify-content: flex-start;
        }

        .scenario-grid,
        .endpoint-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <header class="topbar">
        <div>
          <p class="eyebrow">Mock backend</p>
          <h1>HAL Mock API Console</h1>
          <p class="copy">Inspect mock responses and switch the API into testing scenarios.</p>
        </div>
        <div class="actions">
          <a class="link-button" href="http://127.0.0.1:4200/">Open dashboard</a>
          <button type="button" id="refresh-button">Refresh responses</button>
          <button type="button" id="reset-button">Reset scenario data</button>
        </div>
      </header>

      <section class="panel" aria-labelledby="scenario-heading">
        <div>
          <p class="eyebrow">Active scenario</p>
          <h2 id="scenario-heading">Choose API behavior</h2>
        </div>
        <div id="scenario-grid" class="scenario-grid"></div>
      </section>

      <section class="panel" aria-labelledby="notes-heading">
        <div>
          <p class="eyebrow">Testing notes</p>
          <h2 id="notes-heading">How changes apply</h2>
        </div>
        <ul id="notes" class="note-list"></ul>
      </section>

      <section class="panel" aria-labelledby="responses-heading">
        <div>
          <p class="eyebrow">Responses</p>
          <h2 id="responses-heading">Current endpoint previews</h2>
          <p class="meta" id="api-base"></p>
        </div>
        <div id="endpoint-grid" class="endpoint-grid"></div>
      </section>
    </main>

    <script>
      const scenarioGrid = document.querySelector('#scenario-grid');
      const endpointGrid = document.querySelector('#endpoint-grid');
      const notes = document.querySelector('#notes');
      const apiBase = document.querySelector('#api-base');
      const refreshButton = document.querySelector('#refresh-button');
      const resetButton = document.querySelector('#reset-button');

      refreshButton.addEventListener('click', loadMockState);
      resetButton.addEventListener('click', resetScenarioData);

      async function loadMockState() {
        const response = await fetch('/api/mock', { cache: 'no-store' });
        const state = await response.json();
        renderState(state);
      }

      async function setScenario(scenario) {
        const response = await fetch('/api/mock/scenario', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario }),
        });
        const state = await response.json();
        renderState(state);
      }

      async function resetScenarioData() {
        const response = await fetch('/api/mock/reset', { method: 'POST' });
        const state = await response.json();
        renderState(state);
      }

      function renderState(state) {
        apiBase.textContent = 'API base URL: ' + state.apiBaseUrl;
        renderScenarios(state.scenarios, state.activeScenario);
        renderNotes(state.notes);
        renderEndpoints(state.endpoints);
      }

      function renderScenarios(scenarios, activeScenario) {
        scenarioGrid.replaceChildren();

        for (const scenario of scenarios) {
          const card = document.createElement('article');
          card.className = 'scenario-card' + (scenario.id === activeScenario ? ' active' : '');

          const title = document.createElement('h3');
          title.textContent = scenario.label;

          const summary = document.createElement('p');
          summary.className = 'copy';
          summary.textContent = scenario.summary;

          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = scenario.id === activeScenario ? 'Active' : 'Use scenario';
          button.disabled = scenario.id === activeScenario;
          button.addEventListener('click', () => setScenario(scenario.id));

          card.append(title, summary, button);
          scenarioGrid.append(card);
        }
      }

      function renderNotes(items) {
        notes.replaceChildren();

        for (const item of items) {
          const note = document.createElement('li');
          note.className = 'note';
          note.textContent = item;
          notes.append(note);
        }
      }

      function renderEndpoints(endpoints) {
        endpointGrid.replaceChildren();

        if (endpoints.length === 0) {
          const empty = document.createElement('p');
          empty.className = 'empty';
          empty.textContent = 'No endpoint previews available.';
          endpointGrid.append(empty);
          return;
        }

        for (const endpoint of endpoints) {
          const card = document.createElement('article');
          card.className = 'endpoint-card';

          const head = document.createElement('div');
          head.className = 'endpoint-head';

          const title = document.createElement('div');
          title.className = 'endpoint-title';

          const label = document.createElement('h3');
          label.textContent = endpoint.label;

          const path = document.createElement(endpoint.href ? 'a' : 'code');
          path.textContent = endpoint.method + ' ' + endpoint.path;

          if (endpoint.href) {
            path.href = endpoint.href;
            path.target = '_blank';
            path.rel = 'noreferrer';
          }

          const badges = document.createElement('div');
          badges.className = 'actions';

          const method = document.createElement('span');
          method.className = 'method';
          method.textContent = endpoint.method;

          const status = document.createElement('span');
          status.className = 'status ' + statusClass(endpoint.status);
          status.textContent = String(endpoint.status);

          badges.append(method, status);
          title.append(label, path);
          head.append(title, badges);

          const preview = document.createElement('pre');
          preview.textContent = JSON.stringify(endpoint.body, null, 2);

          card.append(head, preview);
          endpointGrid.append(card);
        }
      }

      function statusClass(status) {
        if (status >= 500 || status === 403) {
          return 'error';
        }

        if (status >= 400) {
          return 'warn';
        }

        return 'ok';
      }

      loadMockState().catch((error) => {
        endpointGrid.textContent = 'Mock console failed to load: ' + error.message;
      });
    </script>
  </body>
</html>`;
}

function cloneState(state) {
  return {
    catalog: clone(state.catalog),
    resources: clone(state.resources),
    requests: clone(state.requests),
    workflows: clone(state.workflows),
    events: clone(state.events),
    landingZones: clone(state.landingZones),
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortByDate(items, key) {
  return [...items].sort((left, right) => right[key].localeCompare(left[key]));
}

function nameFromEmail(email) {
  const localPart = email.split('@')[0] || 'hal-user';

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
