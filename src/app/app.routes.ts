import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';
import { DashboardComponent } from './dashboard.component';
import { DashboardStateService } from './dashboard-state.service';
import { DashboardAdminComponent } from './dashboard/admin.component';
import { DashboardCatalogComponent } from './dashboard/catalog.component';
import { DashboardEventsComponent } from './dashboard/events.component';
import { DashboardLandingZonesComponent } from './dashboard/landing-zones.component';
import { DashboardOverviewComponent } from './dashboard/overview.component';
import { DashboardRequestsComponent } from './dashboard/requests.component';
import { DashboardWorkflowsComponent } from './dashboard/workflows.component';
import { LoginComponent } from './login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    providers: [DashboardStateService],
    children: [
      {
        path: 'overview',
        component: DashboardOverviewComponent,
      },
      {
        path: 'catalog',
        component: DashboardCatalogComponent,
      },
      {
        path: 'requests',
        component: DashboardRequestsComponent,
      },
      {
        path: 'workflows',
        component: DashboardWorkflowsComponent,
      },
      {
        path: 'landing-zones',
        component: DashboardLandingZonesComponent,
      },
      {
        path: 'events',
        component: DashboardEventsComponent,
      },
      {
        path: 'admin',
        component: DashboardAdminComponent,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
