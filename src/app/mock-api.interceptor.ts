import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  AuthUser,
  EventLog,
  InfrastructureRequest,
  LandingZone,
  ManagedResource,
  RequestSubmission,
  ServiceProduct,
  Workflow,
} from './models';

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

const catalog: ServiceProduct[] = [
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
    id: 'redis-cache',
    name: 'Redis Cache',
    category: 'Data',
    summary: 'Low-latency cache with standard sizing and alert thresholds.',
    owner: 'Runtime platform',
    deliveryTime: '20-40 min',
    risk: 'Low',
    status: 'AVAILABLE',
    tags: ['cache', 'managed', 'fast'],
    cues: ['No persistent data', 'Quota applied by team'],
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
    summary: 'Account or subscription baseline with guardrails, logging, and repo wiring.',
    owner: 'Cloud foundations',
    deliveryTime: '1-2 days',
    risk: 'High',
    status: 'RESTRICTED',
    tags: ['network', 'guardrails', 'compliance'],
    cues: ['Approval required', 'Security baseline enforced'],
  },
  {
    id: 'cicd-pipeline',
    name: 'Delivery Pipeline',
    category: 'Delivery',
    summary: 'Build, scan, deploy, and release flow connected to team repositories.',
    owner: 'Developer experience',
    deliveryTime: '30-60 min',
    risk: 'Low',
    status: 'AVAILABLE',
    tags: ['build', 'scan', 'release'],
    cues: ['SAST enabled', 'Requires branch protection'],
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
  {
    id: 'observability-pack',
    name: 'Observability Pack',
    category: 'Operations',
    summary: 'Dashboards, alerts, service objectives, and incident routing for a workload.',
    owner: 'Reliability team',
    deliveryTime: '10-20 min',
    risk: 'Low',
    status: 'AVAILABLE',
    tags: ['alerts', 'metrics', 'logs'],
    cues: ['Default SLO included', 'Incident route required'],
  },
  {
    id: 'api-gateway',
    name: 'API Gateway Route',
    category: 'Network',
    summary: 'Managed route, certificate, WAF policy, and traffic telemetry.',
    owner: 'Network platform',
    deliveryTime: '40-80 min',
    risk: 'Medium',
    status: 'BETA',
    tags: ['tls', 'waf', 'edge'],
    cues: ['Beta support window', 'Requires DNS owner approval'],
  },
];

let resources: ManagedResource[] = [
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
    name: 'ledger-cache-eu',
    team: 'Finance',
    service: 'Redis Cache',
    environment: 'Staging',
    lifecycle: 'LIVE',
    health: 'Healthy',
    cicd: 'Passing',
    drift: 'None',
    version: '7.2.5',
    alerts: 0,
    diagnostic: 'Replication lag is below warning threshold.',
    remediation: 'No action required.',
    updatedAt: ago(27),
  },
  {
    id: 'res-104',
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
  {
    id: 'res-105',
    name: 'analytics-lz',
    team: 'Analytics',
    service: 'Cloud Landing Zone',
    environment: 'Production',
    lifecycle: 'REQUIRES_APPROVAL',
    health: 'Warning',
    cicd: 'Blocked',
    drift: 'None',
    version: 'lz-2026.06',
    alerts: 1,
    diagnostic: 'Network exception is waiting for cloud foundations review.',
    remediation: 'Attach business justification to request REQ-2218.',
    updatedAt: ago(39),
  },
];

let requests: InfrastructureRequest[] = [
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

let workflows: Workflow[] = [
  {
    id: 'WF-873',
    title: 'Provision identity-vault',
    target: 'identity-vault',
    status: 'waiting',
    progress: 58,
    startedAt: ago(21),
    durationMs: 90_000,
    currentStep: 'Security policy review',
    owner: 'Security platform',
    blockedBy: 'SEC-219',
    nextAction: 'Approve the standard rotation policy.',
  },
  {
    id: 'WF-872',
    title: 'Reconcile commerce-web-namespace',
    target: 'commerce-web-namespace',
    status: 'running',
    progress: 43,
    startedAt: ago(9),
    durationMs: 780_000,
    currentStep: 'Opening remediation pull request',
    owner: 'Container platform',
    nextAction: 'Review PR #482 when checks finish.',
  },
  {
    id: 'WF-871',
    title: 'Refresh ledger-cache-eu certificate',
    target: 'ledger-cache-eu',
    status: 'completed',
    progress: 100,
    startedAt: ago(80),
    durationMs: 300_000,
    currentStep: 'Completed',
    owner: 'Runtime platform',
    nextAction: 'No action required.',
  },
];

let events: EventLog[] = [
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
  {
    id: 'EVT-9002',
    timestamp: ago(19),
    severity: 'success',
    source: 'CI/CD',
    message: 'ledger-cache-eu certificate refresh completed.',
    diagnostic: 'Pipeline run 1289 passed all smoke checks.',
    remediation: 'No action required.',
  },
  {
    id: 'EVT-9001',
    timestamp: ago(36),
    severity: 'critical',
    source: 'Alert manager',
    message: 'analytics-lz requires network exception review.',
    diagnostic: 'Requested route conflicts with the shared egress policy.',
    remediation:
      'Cloud foundations must approve the exception or choose a standard route.',
  },
];

const landingZones: LandingZone[] = [
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
      {
        id: '#477',
        title: 'Update observability baseline',
        status: 'Merged',
        age: '1 day',
        reviewer: 'Reliability team',
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
  {
    id: 'lz-003',
    name: 'identity-shared',
    owner: 'Identity',
    cloud: 'GCP',
    lifecycle: 'LIVE',
    repos: ['identity/landing-zone', 'identity/security-services'],
    pullRequests: [
      {
        id: '#219',
        title: 'Rotate vault policy baseline',
        status: 'Approved',
        age: '18 min',
        reviewer: 'Security platform',
      },
    ],
    diagnostic: 'Security baseline update approved and ready to merge.',
  },
];

export const mockApiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const path = req.url.replace(/^https?:\/\/[^/]+/, '');

  if (!path.startsWith('/api')) {
    return next(req);
  }

  if (req.method === 'POST' && path === '/api/session') {
    return handleSession(req);
  }

  if (req.method === 'GET' && path === '/api/catalog') {
    return respond(catalog);
  }

  if (req.method === 'GET' && path === '/api/resources') {
    return respond(resources);
  }

  if (req.method === 'GET' && path === '/api/requests') {
    return respond(
      [...requests].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt),
      ),
    );
  }

  if (req.method === 'POST' && path === '/api/requests') {
    return handleRequest(req);
  }

  if (req.method === 'GET' && path === '/api/workflows') {
    return respond(hydrateWorkflows());
  }

  if (req.method === 'GET' && path === '/api/events') {
    return respond(
      [...events].sort((left, right) =>
        right.timestamp.localeCompare(left.timestamp),
      ),
    );
  }

  if (req.method === 'GET' && path === '/api/landing-zones') {
    return respond(landingZones);
  }

  return throwError(
    () =>
      new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: req.url,
        error: { message: `No mock endpoint for ${req.method} ${path}` },
      }),
  );
};

function handleSession(req: HttpRequest<unknown>) {
  const body = req.body as { email?: string; password?: string };

  if (!body.email || !body.password) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 400,
          statusText: 'Bad Request',
          url: req.url,
          error: { message: 'Email and password are required.' },
        }),
    );
  }

  const user: AuthUser = {
    name: nameFromEmail(body.email),
    email: body.email,
    team: 'Platform consumers',
    roles: ['Platform admin', 'Team admin', 'Approver', 'Read-only audit'],
    activeRole: 'Team admin',
  };

  return respond(user);
}

function handleRequest(req: HttpRequest<unknown>) {
  const body = req.body as {
    environment?: string;
    model?: string;
    name?: string;
    serviceId?: string;
  };
  const service = catalog.find((item) => item.id === body.serviceId);

  if (!body.name || !body.model || !body.environment || !service) {
    return throwError(
      () =>
        new HttpErrorResponse({
          status: 422,
          statusText: 'Unprocessable Entity',
          url: req.url,
          error: {
            message: 'A name, service, environment, and model are required.',
          },
        }),
    );
  }

  const needsApproval =
    service.status === 'RESTRICTED' ||
    service.risk === 'High' ||
    body.environment === 'Production';
  const createdAt = new Date().toISOString();
  const request: InfrastructureRequest = {
    id: `REQ-${2219 + requests.length}`,
    name: body.name,
    serviceId: service.id,
    serviceName: service.name,
    requester: 'Current user',
    team: 'Platform consumers',
    environment: body.environment,
    status: needsApproval ? 'REQUIRES_APPROVAL' : 'PENDING',
    model: body.model,
    createdAt,
  };
  const workflow: Workflow = {
    id: `WF-${874 + workflows.length}`,
    title: `${needsApproval ? 'Review' : 'Provision'} ${body.name}`,
    target: body.name,
    status: needsApproval ? 'waiting' : 'running',
    progress: needsApproval ? 18 : 3,
    startedAt: createdAt,
    durationMs: needsApproval ? 900_000 : 420_000,
    currentStep: needsApproval ? 'Approval gate' : 'Planning infrastructure graph',
    owner: service.owner,
    blockedBy: needsApproval ? 'Approval policy' : undefined,
    nextAction: needsApproval
      ? 'Approver must review the declared model.'
      : 'Track workflow progress until rollout completes.',
  };
  const resource: ManagedResource = {
    id: `res-${106 + resources.length}`,
    name: body.name,
    team: 'Platform consumers',
    service: service.name,
    environment: body.environment,
    lifecycle: request.status,
    health: 'Warning',
    cicd: needsApproval ? 'Blocked' : 'Running',
    drift: 'None',
    version: 'pending',
    alerts: needsApproval ? 1 : 0,
    diagnostic: needsApproval
      ? 'Request is waiting at an approval gate.'
      : 'Provisioning is in progress.',
    remediation: needsApproval
      ? 'Approver can review the declared model in the admin view.'
      : 'No action required while automation is running.',
    updatedAt: createdAt,
  };
  const event: EventLog = {
    id: `EVT-${9005 + events.length}`,
    timestamp: createdAt,
    severity: needsApproval ? 'warning' : 'info',
    source: 'Request API',
    message: `${request.id} submitted for ${service.name}.`,
    diagnostic: needsApproval
      ? 'Policy marked the request for manual review.'
      : 'Automation accepted the declarative model.',
    remediation: workflow.nextAction,
  };

  requests = [request, ...requests];
  workflows = [workflow, ...workflows];
  resources = [resource, ...resources];
  events = [event, ...events];

  const response: RequestSubmission = { request, workflow };
  return respond(response, 201);
}

function hydrateWorkflows() {
  return workflows.map((workflow) => {
    if (workflow.status !== 'running' && workflow.status !== 'queued') {
      return workflow;
    }

    const elapsed = Date.now() - Date.parse(workflow.startedAt);
    const progress = Math.min(
      96,
      Math.max(workflow.progress, Math.round((elapsed / workflow.durationMs) * 100)),
    );

    if (progress >= 96) {
      workflow.status = 'completed';
      workflow.progress = 100;
      workflow.currentStep = 'Completed';
      workflow.nextAction = 'No action required.';
      return workflow;
    }

    workflow.progress = progress;
    workflow.currentStep =
      progress > 72
        ? 'Validating service health'
        : progress > 44
          ? 'Applying infrastructure changes'
          : 'Planning infrastructure graph';

    return workflow;
  });
}

function respond<T>(body: T, status = 200) {
  return of(new HttpResponse({ status, body })).pipe(delay(180));
}

function nameFromEmail(email: string) {
  const localPart = email.split('@')[0] || 'hal-user';

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
