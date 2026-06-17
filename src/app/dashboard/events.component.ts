import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../dashboard-state.service';

@Component({
  selector: 'app-dashboard-events',
  imports: [CommonModule],
  templateUrl: './events.component.html',
})
export class DashboardEventsComponent {
  readonly state = inject(DashboardStateService);
}
