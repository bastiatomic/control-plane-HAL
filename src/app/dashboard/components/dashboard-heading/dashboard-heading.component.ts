import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../../../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-heading',
  templateUrl: './dashboard-heading.component.html',
})
export class DashboardHeadingComponent {
  readonly state = inject(DashboardStateService);
}
