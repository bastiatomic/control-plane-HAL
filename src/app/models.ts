export type UserRole =
  | 'Platform admin'
  | 'Team admin'
  | 'Approver'
  | 'Read-only audit';

export type LifecycleStatus =
  | 'LIVE'
  | 'PENDING'
  | 'REQUIRES_APPROVAL'
  | 'DEGRADED'
  | 'FAILED'
  | 'RETIRED';

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';
export type PipelineStatus = 'Passing' | 'Running' | 'Blocked' | 'Failed';
export type DriftStatus = 'None' | 'Detected' | 'Suppressed';
export type WorkflowStatus =
  | 'queued'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'failed';

export interface AuthUser {
  name: string;
  email: string;
  team: string;
  roles: UserRole[];
  activeRole: UserRole;
}

export interface ServiceProduct {
  id: string;
  name: string;
  category: string;
  summary: string;
  owner: string;
  deliveryTime: string;
  risk: 'Low' | 'Medium' | 'High';
  status: 'AVAILABLE' | 'BETA' | 'RESTRICTED';
  tags: string[];
  cues: string[];
}

export interface ManagedResource {
  id: string;
  name: string;
  team: string;
  service: string;
  environment: string;
  lifecycle: LifecycleStatus;
  health: HealthStatus;
  cicd: PipelineStatus;
  drift: DriftStatus;
  version: string;
  alerts: number;
  diagnostic: string;
  remediation: string;
  updatedAt: string;
}

export interface InfrastructureRequest {
  id: string;
  name: string;
  serviceId: string;
  serviceName: string;
  requester: string;
  team: string;
  environment: string;
  status: LifecycleStatus;
  model: string;
  createdAt: string;
}

export interface Workflow {
  id: string;
  title: string;
  target: string;
  status: WorkflowStatus;
  progress: number;
  startedAt: string;
  durationMs: number;
  currentStep: string;
  owner: string;
  blockedBy?: string;
  nextAction: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  source: string;
  message: string;
  diagnostic: string;
  remediation: string;
}

export interface PullRequest {
  id: string;
  title: string;
  status: 'Open' | 'Approved' | 'Changes requested' | 'Merged';
  age: string;
  reviewer: string;
}

export interface LandingZone {
  id: string;
  name: string;
  owner: string;
  cloud: string;
  lifecycle: LifecycleStatus;
  repos: string[];
  pullRequests: PullRequest[];
  diagnostic: string;
}

export interface RequestSubmission {
  request: InfrastructureRequest;
  workflow: Workflow;
}
