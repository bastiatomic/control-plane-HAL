import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardStateService } from '../../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-requests',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './requests.component.html',
})
export class DashboardRequestsComponent {
  readonly state = inject(DashboardStateService);
}
