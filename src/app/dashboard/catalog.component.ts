import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardStateService } from '../dashboard-state.service';

@Component({
  selector: 'app-dashboard-catalog',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
})
export class DashboardCatalogComponent {
  readonly state = inject(DashboardStateService);
}
