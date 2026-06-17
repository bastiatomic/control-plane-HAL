import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, forkJoin, interval, takeUntil } from 'rxjs';

import { AuthService } from './auth.service';
import {
  AuthUser,
  EventLog,
  InfrastructureRequest,
  LandingZone,
  ManagedResource,
  RequestSubmission,
  ServiceProduct,
  UserRole,
  Workflow,
} from './models';

type DashboardView =
  | 'overview'
  | 'catalog'
  | 'requests'
  | 'workflows'
  | 'landing-zones'
  | 'events'
  | 'admin';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly destroy$ = new Subject<void>();

  readonly views: { id: DashboardView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'requests', label: 'Requests' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'landing-zones', label: 'Landing Zones' },
    { id: 'events', label: 'Events' },
    { id: 'admin', label: 'Admin' },
  ];
  readonly environments = ['Development', 'Staging', 'Production'];
  readonly roleDescriptions: Record<UserRole, string> = {
    'Platform admin':
      'Full platform operations view with guardrails, queues, and remediation ownership.',
    'Team admin':
      'Team-scoped operations view for service requests, drifts, and repo status.',
    Approver:
      'Approval queue focused on requests waiting for policy or risk decisions.',
    'Read-only audit':
      'Read-only evidence view for lifecycle, events, approvals, and changes.',
  };

  readonly requestForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    serviceId: ['postgres-managed', [Validators.required]],
    environment: ['Development', [Validators.required]],
    model: [
      this.modelTemplate('postgres-managed'),
      [Validators.required, Validators.minLength(20)],
    ],
  });

  activeView: DashboardView = 'overview';
  activeRole: UserRole = 'Team admin';
  catalog: ServiceProduct[] = [];
  events: EventLog[] = [];
  landingZones: LandingZone[] = [];
  loading = true;
  resources: ManagedResource[] = [];
  requests: InfrastructureRequest[] = [];
  requestFeedback = '';
  searchTerm = '';
  selectedCategory = 'All';
  submitting = false;
  user: AuthUser | null = null;
  workflows: Workflow[] = [];
  errorMessage = '';

  ngOnInit() {
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.user = user;
      this.activeRole = user?.activeRole || 'Team admin';
    });

    this.requestForm.controls.serviceId.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((serviceId) => {
        this.requestForm.controls.model.setValue(this.modelTemplate(serviceId));
      });

    this.loadAll();
    interval(3500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadWorkflows());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAll() {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      catalog: this.http.get<ServiceProduct[]>('/api/catalog'),
      resources: this.http.get<ManagedResource[]>('/api/resources'),
      requests: this.http.get<InfrastructureRequest[]>('/api/requests'),
      workflows: this.http.get<Workflow[]>('/api/workflows'),
      events: this.http.get<EventLog[]>('/api/events'),
      landingZones: this.http.get<LandingZone[]>('/api/landing-zones'),
    }).subscribe({
      next: (data) => {
        this.catalog = data.catalog;
        this.resources = data.resources;
        this.requests = data.requests;
        this.workflows = data.workflows;
        this.events = data.events;
        this.landingZones = data.landingZones;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'The mock API did not return dashboard data.';
        this.loading = false;
      },
    });
  }

  loadWorkflows() {
    this.http.get<Workflow[]>('/api/workflows').subscribe({
      next: (workflows) => {
        this.workflows = workflows;
      },
    });
  }

  loadRequestsAndEvents() {
    forkJoin({
      resources: this.http.get<ManagedResource[]>('/api/resources'),
      requests: this.http.get<InfrastructureRequest[]>('/api/requests'),
      workflows: this.http.get<Workflow[]>('/api/workflows'),
      events: this.http.get<EventLog[]>('/api/events'),
    }).subscribe((data) => {
      this.resources = data.resources;
      this.requests = data.requests;
      this.workflows = data.workflows;
      this.events = data.events;
    });
  }

  setRole(role: UserRole) {
    this.auth.setActiveRole(role);
  }

  setView(view: DashboardView) {
    this.activeView = view;
  }

  selectService(service: ServiceProduct) {
    this.requestForm.controls.serviceId.setValue(service.id);
    this.requestForm.controls.model.setValue(this.modelTemplate(service.id));
    this.activeView = 'requests';
  }

  submitRequest() {
    if (!this.canWrite) {
      this.requestFeedback = 'Audit role cannot submit infrastructure requests.';
      return;
    }

    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.requestFeedback =
        'Complete the request name, service, environment, and model.';
      return;
    }

    this.submitting = true;
    this.requestFeedback = '';

    this.http
      .post<RequestSubmission>('/api/requests', this.requestForm.getRawValue())
      .subscribe({
        next: ({ request, workflow }) => {
          this.requestFeedback = `${request.id} is ${request.status}. Workflow ${workflow.id} is ${workflow.status}.`;
          const serviceId = this.requestForm.controls.serviceId.value;
          this.requestForm.patchValue({
            name: '',
            model: this.modelTemplate(serviceId),
          });
          this.loadRequestsAndEvents();
        },
        error: (error) => {
          this.requestFeedback =
            error.error?.message || 'Request submission failed in the mock API.';
        },
        complete: () => {
          this.submitting = false;
        },
      });
  }

  logout() {
    this.auth.logout();
  }

  get canWrite() {
    return this.activeRole !== 'Read-only audit';
  }

  get categories() {
    return ['All', ...new Set(this.catalog.map((service) => service.category))];
  }

  get filteredCatalog() {
    const term = this.searchTerm.trim().toLowerCase();

    return this.catalog.filter((service) => {
      const matchesCategory =
        this.selectedCategory === 'All' ||
        service.category === this.selectedCategory;
      const matchesSearch =
        !term ||
        [
          service.name,
          service.category,
          service.summary,
          service.owner,
          ...service.tags,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      return matchesCategory && matchesSearch;
    });
  }

  get liveResources() {
    return this.resources.filter((resource) => resource.lifecycle === 'LIVE').length;
  }

  get pendingRequests() {
    return this.requests.filter((request) =>
      ['PENDING', 'REQUIRES_APPROVAL'].includes(request.status),
    ).length;
  }

  get alertCount() {
    return this.resources.reduce((total, resource) => total + resource.alerts, 0);
  }

  get driftCount() {
    return this.resources.filter((resource) => resource.drift === 'Detected').length;
  }

  get openAlerts() {
    return this.resources.filter(
      (resource) => resource.alerts > 0 || resource.health !== 'Healthy',
    );
  }

  get activeWorkflows() {
    return this.workflows.filter((workflow) =>
      ['queued', 'running', 'waiting'].includes(workflow.status),
    );
  }

  get approvalQueue() {
    return this.requests.filter((request) => request.status === 'REQUIRES_APPROVAL');
  }

  get roleActions() {
    const role = this.activeRole;

    if (role === 'Platform admin') {
      return [
        {
          title: 'Guardrail exceptions',
          count: this.approvalQueue.length,
          cue: 'Review high-risk requests and standardize recurring exceptions.',
        },
        {
          title: 'Drift remediation',
          count: this.driftCount,
          cue: 'Merge generated PRs or accept declared model updates.',
        },
        {
          title: 'Platform alerts',
          count: this.alertCount,
          cue: 'Prioritize critical alerts with clear owner and remediation.',
        },
      ];
    }

    if (role === 'Approver') {
      return this.approvalQueue.map((request) => ({
        title: request.id,
        count: request.environment === 'Production' ? 2 : 1,
        cue: `${request.name} needs approval for ${request.serviceName}.`,
      }));
    }

    if (role === 'Read-only audit') {
      return [
        {
          title: 'Evidence trail',
          count: this.events.length,
          cue: 'Lifecycle changes, approvals, and diagnostics are visible without write access.',
        },
        {
          title: 'Controlled requests',
          count: this.requests.length,
          cue: 'Each request includes requester, declared model, and current status.',
        },
      ];
    }

    return [
      {
        title: 'Team requests',
        count: this.pendingRequests,
        cue: 'Track submitted infrastructure and blockers from one queue.',
      },
      {
        title: 'Open alerts',
        count: this.openAlerts.length,
        cue: 'Use diagnostics and remediation text before escalating.',
      },
      {
        title: 'Repo activity',
        count: this.landingZones.reduce(
          (total, zone) => total + zone.pullRequests.length,
          0,
        ),
        cue: 'Follow the PRs that change landing zone state.',
      },
    ];
  }

  statusClass(status: string) {
    return status.toLowerCase().replace(/[\s_]+/g, '-');
  }

  modelTemplate(serviceId: string) {
    const labels: Record<string, string> = {
      'postgres-managed': 'ManagedPostgreSQL',
      'redis-cache': 'RedisCache',
      'kubernetes-namespace': 'KubernetesNamespace',
      'landing-zone': 'LandingZone',
      'cicd-pipeline': 'DeliveryPipeline',
      'secrets-vault': 'SecretsVault',
      'observability-pack': 'ObservabilityPack',
      'api-gateway': 'ApiGatewayRoute',
    };

    return [
      `kind: ${labels[serviceId] || 'Infrastructure'}`,
      'metadata:',
      '  name: team-service-name',
      '  owner: platform-consumers',
      'spec:',
      '  environment: development',
      '  tier: standard',
      '  backup: true',
      '  alerts: default',
    ].join('\n');
  }
}
