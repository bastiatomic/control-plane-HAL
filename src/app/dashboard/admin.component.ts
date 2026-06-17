import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../dashboard-state.service';

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
})
export class DashboardAdminComponent {
  readonly state = inject(DashboardStateService);
}
