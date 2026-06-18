import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { DashboardStateService } from '../../../services/dashboard-state/dashboard-state.service';

@Component({
  selector: 'app-dashboard-menu',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-menu.component.html',
})
export class DashboardMenuComponent {
  readonly state = inject(DashboardStateService);
}
