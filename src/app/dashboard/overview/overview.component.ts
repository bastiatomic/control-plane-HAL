import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-overview',
  imports: [CommonModule],
  templateUrl: './overview.component.html',
})
export class DashboardOverviewComponent {
  readonly state = inject(DashboardStateService);
}
