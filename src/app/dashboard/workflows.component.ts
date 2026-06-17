import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../dashboard-state.service';

@Component({
  selector: 'app-dashboard-workflows',
  imports: [CommonModule],
  templateUrl: './workflows.component.html',
})
export class DashboardWorkflowsComponent {
  readonly state = inject(DashboardStateService);
}
