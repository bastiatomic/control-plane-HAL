import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { DashboardStateService } from '../../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-landing-zones',
  imports: [CommonModule],
  templateUrl: './landing-zones.component.html',
})
export class DashboardLandingZonesComponent {
  readonly state = inject(DashboardStateService);
}
