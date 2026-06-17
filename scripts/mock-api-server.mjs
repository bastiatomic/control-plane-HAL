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

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${host}:${port}`);

  if (request.method === 'OPTIONS') {
    send(response, null, 204);
    return;
  }

  try {
    await route(request, response, url.pathname);
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

async function route(request, response, path) {
  if (request.method === 'GET' && path === '/api/health') {
    send(response, { ok: true });
  } else if (request.method === 'POST' && path === '/api/session') {
    await handleSession(request, response);
  } else if (request.method === 'GET' && path === '/api/catalog') {
    send(response, catalog);
  } else if (request.method === 'GET' && path === '/api/resources') {
    send(response, resources);
  } else if (request.method === 'GET' && path === '/api/requests') {
    send(response, sortByDate(requests, 'createdAt'));
  } else if (request.method === 'POST' && path === '/api/requests') {
    await handleInfrastructureRequest(request, response);
  } else if (request.method === 'GET' && path === '/api/workflows') {
    send(response, workflows);
  } else if (request.method === 'GET' && path === '/api/events') {
    send(response, sortByDate(events, 'timestamp'));
  } else if (request.method === 'GET' && path === '/api/landing-zones') {
    send(response, landingZones);
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

  send(response, {
    name: nameFromEmail(body.email),
    email: body.email,
    team: 'Platform consumers',
    roles: ['Platform admin', 'Team admin', 'Approver', 'Read-only audit'],
    activeRole: 'Team admin',
  });
}

async function handleInfrastructureRequest(request, response) {
  const body = await readJson(request);
  const service = catalog.find((item) => item.id === body.serviceId);

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
